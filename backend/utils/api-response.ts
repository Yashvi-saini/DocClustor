import { NextResponse } from 'next/server';
// 200 created
export function successResponse<T>(data: T, message = 'Success', status = 200) {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  );
}

//400 error for bad requests
export function errorResponse(message: string, status = 400, errors?: Record<string, string[]>) {
  return NextResponse.json(
    { success: false, message, ...(errors && { errors }) },
    { status }
  );
}

//201 created
export function createdResponse<T>(data: T, message = 'Created successfully') {
  return successResponse(data, message, 201);
}

//404 bad request
export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}
