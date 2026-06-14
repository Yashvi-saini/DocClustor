// ─── API Response Helpers ──────────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// Every API route returns JSON in the same shape: { success, message, data }
// Instead of typing that out every time, we use these helper functions.
// This ensures CONSISTENT response format across ALL endpoints.
//
// Consistent APIs = easier for frontend to handle, looks professional.
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';

/**
 * Return a success JSON response (200 OK by default)
 */
export function successResponse<T>(data: T, message = 'Success', status = 200) {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  );
}

/**
 * Return an error JSON response (400 Bad Request by default)
 */
export function errorResponse(message: string, status = 400, errors?: Record<string, string[]>) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

/**
 * Return a 201 Created response (used after creating a resource)
 */
export function createdResponse<T>(data: T, message = 'Created successfully') {
  return successResponse(data, message, 201);
}

/**
 * Return a 404 Not Found response
 */
export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}
