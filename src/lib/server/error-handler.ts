import { NextResponse } from "next/server";
import { HttpStatus, HttpStatusCode } from "../enums";

export interface ServerError {
  success: false;
  status: HttpStatusCode;
  error: {
    message: string;
  };
}

export function ApiErrorResponse(
  status: HttpStatusCode,
  dataName = "Resource"
) {
  let message: string;

  switch (status) {
    case HttpStatus.BAD_REQUEST:
      message = `Invalid or missing ${dataName}. Please check your request.`;
      break;
    case HttpStatus.NOT_FOUND:
      message = `${dataName} not found.`;
      break;
    case HttpStatus.UNAUTHORIZED:
      message = `Authentication required for this ${dataName}.`;
      break;
    case HttpStatus.FORBIDDEN:
      message = `Access to this ${dataName} is forbidden.`;
      break;
    case HttpStatus.METHOD_NOT_ALLOWED:
      message = `Method not allowed for this ${dataName}.`;
      break;
    case HttpStatus.CONFLICT:
      message = `Conflict with existing ${dataName}.`;
      break;
    case HttpStatus.UNPROCESSABLE_ENTITY:
      message = `Unable to process the ${dataName} provided.`;
      break;
    case HttpStatus.TOO_MANY_REQUESTS:
      message = `Too many requests for ${dataName}. Please try again later.`;
      break;
    default:
      message = "An unexpected error occurred.";
  }

  const errorBody: ServerError = {
    success: false,
    status,
    error: { message },
  };

  return NextResponse.json(errorBody, { status });
}
