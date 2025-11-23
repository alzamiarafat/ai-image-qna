const fs = require('fs');
const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const expressSession = require('express-session');
const cors = require('cors');

const connectDB = require('./config/db');
const redisStore = require('./config/redis');
const errorHandler = require('./middlewares/errorHandler');
const { middleware: contextMiddleware } = require('./utils/context');
const { InfoLog, ErrorLog } = require('./utils/winston');


// initialize env config
dotenv.config();

// connect DB
connectDB();

// initialize express app
const app = express();
app.use(express.json());
app.set('trust proxy', true);

// configure cors
const corsConfig = {
  origin: function (_origin, callback) {
    return callback(null, true);
  },
  // origin: allowedOrigins,
  credentials: true // enable set cookie
};
app.use(cors(corsConfig));

// Initialize express sesssion with redis storage.
app.use(
  expressSession({
    key: 'yolo-auth',
    secret: 'yolosecret',
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hour = 1000 * 60 * 60
    },
  })
);

app.use((req, res, next) => {
  let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  if (ip?.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  next();
});

// setting routes
app.get('/_status', (req, res) => {
  res.send('Server is okay.');
});

app.use(contextMiddleware);

// Function to capture and log routes
function logDefinedRoutes(expressApp) {
  const routes = [];

  // Get all routes from the app
  if (expressApp._router && expressApp._router.stack) {
    expressApp._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // Direct route
        const methods = Object.keys(middleware.route.methods);
        routes.push({
          path: middleware.route.path,
          methods: methods.map(method => method.toUpperCase())
        });
      } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
        // Router middleware
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const methods = Object.keys(handler.route.methods);
            routes.push({
              path: handler.route.path,
              methods: methods.map(method => method.toUpperCase())
            });
          }
        });
      }
    });
  }

  return routes;
}

fs.readdirSync(path.join(__dirname, '/routes')).map(file => {
  require('./routes/' + file)(app);
});

// Log all defined routes after they are loaded
const definedRoutes = logDefinedRoutes(app);

definedRoutes.forEach((route, index) => {
  InfoLog(`Route ${index + 1}`, `${route.methods.join(', ')} '${route.path}'`, 'Routes');
});
InfoLog('Routes loaded successfully', { totalRoutes: definedRoutes.length }, 'Routes');

app.use(errorHandler.invalidPathHandler);
app.use(errorHandler.errorResponserHandler);

// Initialize server
const PORT = process.env.PORT;
app.listen(PORT, (err) => {
  if (err) {
    ErrorLog('Failed to start server', err, 'Server');
    process.exit(1);
  }
  InfoLog(`Service is running at port:${PORT}`, null , 'Server');
});

