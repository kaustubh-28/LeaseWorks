export class ValidationError extends Error {
  errors: Record<string, string>;
  constructor(errors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

import { json } from '@sveltejs/kit';

export function handleServiceError(error: unknown) {
  if (error instanceof ValidationError) {
    // Return validation errors as the primary message or dictionary
    const firstError = Object.values(error.errors)[0] || 'Validation failed';
    return json({ message: firstError, errors: error.errors }, { status: 400 });
  }
  if (error instanceof NotFoundError) {
    return json({ message: error.message }, { status: 404 });
  }
  if (error instanceof AuthorizationError) {
    return json({ message: error.message }, { status: 403 });
  }
  console.error('Unexpected server error:', error);
  return json({ 
    message: 'An unexpected server error occurred',
    details: error instanceof Error ? error.message : String(error)
  }, { status: 500 });
}
