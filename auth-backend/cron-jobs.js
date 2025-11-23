const dotenv = require('dotenv');
const cron = require('node-cron');

const connectDB = require('./config/db');
const { sendScheduledSmsJob } = require('./jobs/smsJobs');


// initialize env config
dotenv.config();

// connect DB
connectDB();

// initialize models
require('./models');

