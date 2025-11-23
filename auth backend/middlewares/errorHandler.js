const errorResponserHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 400;
  let message = err.message || 'An error occurred';

  // Handle Axios errors specifically
  if (err.response && err.response.data) {
    const errorData = err.response.data;
    statusCode = err.response.status || statusCode;
    message = errorData.message || errorData.error || message;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // Handle API-specific errors
  if (err.apiError) {
    statusCode = err.statusCode || 400;
    message = err.message;
  }

  const response = {
    issuccess: false,
    message: message,
    statusCode: statusCode,
    data: null
  };

  res.status(statusCode).send(response);
};

const invalidPathHandler = (req, res, next) => {
  let error = new Error("Invalid Path");
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorResponserHandler,
  invalidPathHandler
}