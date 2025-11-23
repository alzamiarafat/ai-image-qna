const authGuard = async (req, res, next) => {
  const sessionUser = req?.session?.user;

  if (!sessionUser) {
    let error = new Error('Not authorized, no user.');
    error.statusCode = 401;
    next(error);
  } else {
    req.user = req?.session?.user;
    next();
  }
};

const platformGuard = async (req, res, next) => {
  const detector = new DeviceDetector();
  const userAgent = detector.detect(req.headers['user-agent']);
  if (!userAgent?.os?.name && userAgent.client.type === 'library') {
    console.log('Restricted for scripting', req?._parsedOriginalUrl?.path, req?.route?.methods);
    let err = new Error('Access forbidden');
    err.statusCode = 403;
    next(err);
  } else {
    next();
  }
};

module.exports = {
  authGuard,
  platformGuard,
};
