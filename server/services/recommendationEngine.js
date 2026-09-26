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

  // Fetch user history (reviews & orders)
  const reviews = await Review.find({ userId });
  const orders = await Order.find({ userId });
  
  const userRatings = {}; // productId -> rating (1-5)
  reviews.forEach(r => userRatings[r.productId.toString()] = r.rating);
  orders.forEach(o => {
    o.items.forEach(i => {
      if (!userRatings[i.productId.toString()]) {
        userRatings[i.productId.toString()] = 4; // Implicit rating
      }
    });
  });

  // ITEM-BASED COLLABORATIVE FILTERING matrix
  const allReviews = await Review.find();
  const allOrders = await Order.find();
  const itemUserRatings = {}; // productId -> { userId: rating }

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
    
    // We can use a simpler vector approach for users
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

  const scores = [];
  products.forEach(p => {
    const pid = p._id.toString();
    if (userRatings[pid]) return; // Skip already interacted

    // Content Based Score
    let contentScore = 0;
    let maxContentSim = 0;
    const pFeat = productFeatures[pid];
    for (const interactedId in userRatings) {
      const sim = cosineSimilarity(pFeat, productFeatures[interactedId] || {});
      if (sim > maxContentSim) maxContentSim = sim;
    }
    contentScore = maxContentSim;

    // Collab Score
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
    collabScore = simSum > 0 ? (weightedSum / simSum) / 5.0 : 0; // Normalize 0-1

    const hybridScore = 0.4 * contentScore + 0.6 * collabScore;
    scores.push({
      productId: p._id,
      score: hybridScore,
      type: hybridScore > 0 ? 'Hybrid' : 'Random'
    });
  });

  scores.sort((a, b) => b.score - a.score);
  const top10 = scores.slice(0, 10);

  await Recommendation.findOneAndUpdate(
    { userId },
    { recommended: top10, generatedAt: Date.now() },
    { upsert: true, new: true }
  );
};

module.exports = { generateForUser };