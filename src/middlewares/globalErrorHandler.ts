import { ErrorRequestHandler } from 'express';
import ApiError from '../errors/ApiError';
import mongoose from 'mongoose';
import config from '../app/config';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  let errorDetails = err;
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    const errors = Object.values(err.errors).map((el: any) => ({
      field: el.path,
      message: el.message,
    }));
    errorDetails = { issues: errors };
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid ID Provided';
    errorDetails = {
      path: err.path,
      message: `Invalid ${err.path}: ${err.value} format.`,
    };
  } else if (err.code && err.code === 11000) {
    statusCode = 409; // Conflict
    message = 'Duplicate entry!';
    const match = err.message.match(/"([^"]*)"/);
    const extractedMessage = match && match[1];
    errorDetails = {
      message: `${extractedMessage || 'Duplicate key'} already exists.`,
    };
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
    errorDetails = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails:
      config.node_env === 'development'
        ? errorDetails
        : 'Internal Server Error',
    stack: config.node_env === 'development' ? err?.stack : undefined,
  });
};

export default globalErrorHandler;
