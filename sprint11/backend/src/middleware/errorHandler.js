import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { isProduction } from '../config/env.js';

export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist on this API`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error instanceof multer.MulterError) {
    statusCode = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded image exceeds the maximum allowed size'
        : `Upload rejected: ${error.message}`;
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors ?? {}).map((issue) => issue.message);
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Malformed identifier: ${error.value}`;
  }

  if (statusCode >= 500) {
    // FAQ #9: the browser console cannot help here - the stack trace must land in the Node logs.
    console.error('[error]', error.stack || error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(isProduction ? {} : { stack: error.stack }),
  });
};
