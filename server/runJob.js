require('dotenv').config();
const connectDB = require('./config/db');
const runJob = require('./jobs/recomputeRecommendations');

const manualRun = async () => {
  await connectDB();
  await runJob();
};

if (require.main === module) {
  manualRun().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = manualRun;
