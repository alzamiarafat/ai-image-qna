const { authGuard } = require('../middlewares/authMiddleware');
const authControllers = require('../controllers/authControllers');

module.exports = app => {
  app.post('/api/auth/register', authControllers.registerUser);
  app.post('/api/auth/login', authControllers.loginUser);
  // app.post('/api/auth/session/logout', authControllers.sessionLogout);
  app.post('/api/auth/current-user', authControllers.currentUser);
  // app.post('/api/auth/logout', authGuard, authControllers.logout);
};
