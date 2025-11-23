const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

const middleware = (req, res, next) => {
  asyncLocalStorage.run(new Map(), () => {
    asyncLocalStorage.getStore().set('authUser', req.session?.user);
    next();
  });
};

const getAuthUser = () => {
  return asyncLocalStorage.getStore()?.get('authUser');
};

module.exports = {
  asyncLocalStorage,
  middleware,
  getAuthUser,
};
