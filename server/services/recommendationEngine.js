const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Recommendation = require('../models/Recommendation');

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (const key in vecA) {
    if (vecB[key]) dotProduct += vecA[key] * vecB[key];
    normA += vecA[key] * vecA[key];
  }
  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function extractFeatures(product, maxPrice) {
  const features = {};
  features[`cat_${product.category}`] = 1;
  if (product.subCategory) features[`sub_${product.subCategory}`] = 1;
  if (product.tags) {
    product.tags.forEach(t => features[`tag_${t}`] = 1);
  }
  features['price_norm'] = maxPrice ? (product.price / maxPrice) : 0;
  return features;
}

const generateForUser = async (userId) => {
  const products = await Product.find();
  let maxPrice = 0;
  products.forEach(p => { if (p.price > maxPrice) maxPrice = p.price; });

  const productFeatures = {};
  products.forEach(p => {
    productFeatures[p._id.toString()] = extractFeatures(p, maxPrice);
  });

  const reviews = await Review.find({ userId });
  const orders = await Order.find({ userId });
  
  const userRatings = {}; 
  const purchasedProducts = new Set();
  reviews.forEach(r => userRatings[r.productId.toString()] = r.rating);
  orders.forEach(o => {
    o.items.forEach(i => {
      if (!userRatings[i.productId.toString()]) {
        userRatings[i.productId.toString()] = 4;
      }
      purchasedProducts.add(i.productId.toString());
    });
  });

  const interactionCount = Object.keys(userRatings).length;
  
  let scores = [];

  if (interactionCount < 2) {
    // Cold start
    const trending = await Product.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'productId',
          as: 'revs'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: "$revs" }
        }
      },
      {
        $addFields: {
          trendingScore: { $multiply: ["$avgRating", "$reviewCount"] }
        }
      },
      { $sort: { trendingScore: -1 } }
    ]);
    
    trending.forEach(p => {
      if (!purchasedProducts.has(p._id.toString()) && p.stock > 0) {
        scores.push({
          productId: p._id,
          score: p.trendingScore > 0 ? p.trendingScore : Math.random(),
          type: 'Trending',
          reason: 'Trending Now',
          category: p.category
        });
      }
    });
    const maxT = Math.max(...scores.map(s => s.score), 1);
    scores.forEach(s => s.score = s.score / maxT);
  } else {
    // Hybrid
    const allReviews = await Review.find();
    const allOrders = await Order.find();
    const itemUserRatings = {};

    allReviews.forEach(r => {
      const pid = r.productId.toString();
      const uid = r.userId.toString();
      if (!itemUserRatings[pid]) itemUserRatings[pid] = {};
      itemUserRatings[pid][uid] = r.rating;
    });

    allOrders.forEach(o => {
      const uid = o.userId.toString();
      o.items.forEach(i => {
        const pid = i.productId.toString();
        if (!itemUserRatings[pid]) itemUserRatings[pid] = {};
        if (!itemUserRatings[pid][uid]) itemUserRatings[pid][uid] = 4;
      });
    });

    const getCollabSimilarity = (pid1, pid2) => {
      const users1 = itemUserRatings[pid1] || {};
      const users2 = itemUserRatings[pid2] || {};
      let dot = 0, n1 = 0, n2 = 0;
      for (let u in users1) {
        if (users2[u]) dot += users1[u] * users2[u];
        n1 += users1[u] * users1[u];
      }
      for (let u in users2) {
        n2 += users2[u] * users2[u];
      }
      if (n1 === 0 || n2 === 0) return 0;
      return dot / (Math.sqrt(n1) * Math.sqrt(n2));
    };

    products.forEach(p => {
      const pid = p._id.toString();
      if (purchasedProducts.has(pid) || p.stock <= 0 || userRatings[pid]) return;

      let contentScore = 0;
      let maxContentSim = 0;
      let bestContentMatch = null;
      const pFeat = productFeatures[pid];
      for (const interactedId in userRatings) {
        const sim = cosineSimilarity(pFeat, productFeatures[interactedId] || {});
        if (sim > maxContentSim) {
          maxContentSim = sim;
          bestContentMatch = interactedId;
        }
      }
      contentScore = maxContentSim;

      let collabScore = 0;
      let simSum = 0;
      let weightedSum = 0;
      for (const interactedId in userRatings) {
        const sim = getCollabSimilarity(pid, interactedId);
        if (sim > 0) {
          simSum += sim;
          weightedSum += sim * userRatings[interactedId];
        }
      }
      collabScore = simSum > 0 ? (weightedSum / simSum) / 5.0 : 0; 

      const hybridScore = 0.4 * contentScore + 0.6 * collabScore;
      
      let reason = "Recommended for you";
      if (collabScore > contentScore && collabScore > 0) {
        reason = "Frequently bought with items in your recent orders";
      } else if (contentScore > 0) {
        const matchCat = products.find(x => x._id.toString() === bestContentMatch)?.category || 'items';
        reason = `Because you viewed similar ${matchCat}`;
      }

      scores.push({
        productId: p._id,
        score: hybridScore,
        type: 'Hybrid',
        reason,
        category: p.category
      });
    });
  }

  scores.sort((a, b) => b.score - a.score);
  
  const finalRecs = [];
  const catCounts = {};
  for (const s of scores) {
    if (finalRecs.length >= 10) break;
    const c = s.category;
    if (!catCounts[c]) catCounts[c] = 0;
    if (catCounts[c] < 2) {
      catCounts[c]++;
      finalRecs.push({
        productId: s.productId,
        score: s.score,
        type: s.type,
        reason: s.reason
      });
    }
  }

  await Recommendation.findOneAndUpdate(
    { userId },
    { recommended: finalRecs, generatedAt: Date.now() },
    { upsert: true, new: true }
  );
};

module.exports = { generateForUser };