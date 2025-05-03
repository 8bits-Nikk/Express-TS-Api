import StatusCodes from "../constants/StatusCodes";

class ApiError extends Error {
  statusCode: number | StatusCodes;
  status: string;
  message: string;
  /**
   * Creates an ApiError instance with the given message and HTTP status code.
   * The "status" property is derived from the status code, with codes in the
   * 400 range being "fail" and all other codes being "error". The
   * @param message - The error message.
   * @param statusCode - The HTTP status code.
   */
  constructor(message: string, statusCode: number | StatusCodes) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
