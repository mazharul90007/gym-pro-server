import { ErrorRequestHandler } from 'express';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import config from '../app/config';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong!';
  let errorMessages: { path: string; message: string }[] = [];

  if (error.name === 'ValidationError') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Validation Error!';
    errorMessages = Object.values(error.errors).map((el: any) => ({
      path: el.path,
      message: el.message,
    }));
  } else if (error.name === 'CastError') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Invalid ID';
    errorMessages = [
      { path: error.path, message: `Invalid ${error.path} ID provided.` },
    ];
  } else if (error.code === 11000 && error.keyValue) {
    statusCode = httpStatus.CONFLICT;
    message = 'Duplicate Entry';
    const field = Object.keys(error.keyValue)[0];
    const value = Object.values(error.keyValue)[0];
    errorMessages = [
      { path: field, message: `${field} '${value}' already exists.` },
    ];
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = error.message ? [{ path: '', message: error.message }] : [];
  } else if (error instanceof Error) {
    message = error.message;
    errorMessages = error.message ? [{ path: '', message: error.message }] : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.node_env === 'development' ? error.stack : undefined,
  });
};

export default globalErrorHandler;
