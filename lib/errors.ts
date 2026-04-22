/**
 * @fileoverview Custom error classes and centralized error handling utilities.
 * Provides structured error responses for API routes and services.
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

// ─── Custom Error Classes ───────────────────────────────────────────────────

/**
 * Base application error with HTTP status code support.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when input validation fails.
 */
export class ValidationError extends AppError {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * Error thrown when authentication is required but missing.
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required.') {
    super(message, 401);
  }
}

/**
 * Error thrown when rate limit is exceeded.
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429);
  }
}

/**
 * Error thrown when an external AI service call fails.
 */
export class AIServiceError extends AppError {
  constructor(message: string = 'AI service is temporarily unavailable.') {
    super(message, 503);
  }
}

// ─── Error Handler ──────────────────────────────────────────────────────────

/**
 * Converts any error into a structured NextResponse JSON object.
 * Logs the error with context and returns an appropriate HTTP response.
 *
 * @param error - The caught error object
 * @param context - A string label identifying the source (e.g., "Voter Journey API")
 * @returns NextResponse with appropriate status code and error message
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  if (error instanceof AppError) {
    logger.warn(`[${context}] ${error.name}: ${error.message}`);

    const body: Record<string, unknown> = { error: error.message };
    if (error instanceof ValidationError && error.details) {
      body.details = error.details;
    }

    return NextResponse.json(body, { status: error.statusCode });
  }

  // Unknown / unexpected errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
  logger.error(`[${context}] Unhandled Error: ${message}`, error);

  return NextResponse.json(
    { error: 'An internal server error occurred.' },
    { status: 500 }
  );
}
