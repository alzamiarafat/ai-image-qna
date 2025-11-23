require('dotenv').config();
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const { InfoLog, ErrorLog } = require('../utils/winston');

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT || 6379;

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
    reconnectStrategy: (retries) => {
      if (retries > 1) {
        ErrorLog('Redis reconnection failed after maximum attempts', { retries }, 'Redis');
        return false; // Stop reconnecting after 1 retry
      }
      InfoLog('Redis reconnecting', { attempt: retries + 1, delay: '5000ms' }, 'Redis');
      return 5000; // Retry after 5 seconds
    },
  },
});

// Handle Redis connection events
redisClient.on('connect', () => {
  InfoLog('Redis client connected', null, 'Redis');
});

redisClient.on('ready', () => {
  InfoLog('Redis client ready', null, 'Redis');
});

redisClient.on('error', (err) => {
  ErrorLog('Redis client error', err, 'Redis');
});

redisClient.on('end', () => {
  InfoLog('Redis client disconnected', null, 'Redis');
});

redisClient.on('reconnecting', () => {
  InfoLog('Redis client reconnecting', null, 'Redis');
});

// Initial connection
redisClient
  .connect()
  .then(() => {
    InfoLog('Redis initial connection successful', null, 'Redis');
  })
  .catch((err) => {
    ErrorLog('Redis initial connection failed', err, 'Redis');
  });

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'shebacpanel:',
});

module.exports = redisStore;
