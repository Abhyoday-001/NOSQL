const cron = require('node-cron');
const { generateForUser } = require('../services/recommendationEngine');
const User = require('../models/User');

const runJob = async () => {
  console.log('Running recommendation job...');
  const users = await User.find();
  for (const user of users) {
    // Basic check: we would normally check for interaction. For now, generate for all
    try {
      await generateForUser(user._id);
    } catch (err) {
      console.error(`Failed generating recs for user ${user._id}: `, err);
    }
  }
  console.log('Recommendation job completed.');
};

cron.schedule('0 0 * * *', runJob); // Nightly

module.exports = runJob;