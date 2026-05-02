jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
    })),
  },
}));

import { AppError, ValidationError, AuthenticationError, RateLimitError, AIServiceError, handleApiError } from '../../lib/errors';
import { logger } from '../../lib/logger';

jest.mock('../../lib/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe('Custom Errors', () => {
  it('AppError should set properties correctly', () => {
    const error = new AppError('Test error', 501, false);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(501);
    expect(error.isOperational).toBe(false);
    expect(error.name).toBe('AppError');
  });

  it('ValidationError should default to 400', () => {
    const error = new ValidationError('Invalid input', { field: 'name' });
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: 'name' });
  });

  it('AuthenticationError should default to 401', () => {
    const error = new AuthenticationError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication required.');
  });

  it('RateLimitError should default to 429', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
  });

  it('AIServiceError should default to 503', () => {
    const error = new AIServiceError();
    expect(error.statusCode).toBe(503);
  });
});

describe('handleApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle AppError and return JSON response', () => {
    const error = new ValidationError('Bad request', { id: 'missing' });
    const response = handleApiError(error, 'TestContext');
    
    expect(logger.warn).toHaveBeenCalledWith('[TestContext] ValidationError: Bad request');
    expect(response.status).toBe(400);
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown crash');
    const response = handleApiError(error, 'TestContext');
    
    expect(logger.error).toHaveBeenCalledWith('[TestContext] Unhandled Error: Unknown crash', error);
    expect(response.status).toBe(500);
  });

  it('should handle non-Error objects', () => {
    const response = handleApiError('String error', 'TestContext');
    expect(response.status).toBe(500);
  });
});
