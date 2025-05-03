import ApiError from "./ApiError";

class ApiResponse<T> {
  data: T | null;
  success: boolean;
  message: string;
  statusCode: number;
  error: ApiError | null;

  /**
   * Constructs an ApiResponse instance.
   *
   * @param data - The data of the response, or null if there is no data.
   * @param success - A boolean indicating if the operation was successful.
   * @param message - A message providing additional information about the response.
   * @param statusCode - The HTTP status code associated with the response.
   * @param error - An instance of ApiError if an error occurred, or null if there was no error.
   */

  constructor(
    data: T | null,
    success: boolean,
    message: string,
    statusCode: number,
    error: null | ApiError
  ) {
    this.data = data;
    this.success = success;
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }

  /**
   * Creates an ApiResponse instance to represent a successful operation.
   *
   * @param data - The data associated with the successful operation.
   * @param message - A message providing additional information about the response.
   * @param statusCode - The HTTP status code associated with the response.
   *
   * @returns An ApiResponse instance with the provided data, a success status of true, and no error.
   */
  static success<T>(
    data: T,
    message = "Success",
    statusCode = 200
  ): ApiResponse<T> {
    return new ApiResponse(data, true, message, statusCode, null);
  }

  /**
   * Creates an ApiResponse instance to represent a failed operation.
   *
   * @param error - An instance of ApiError with details about the error.
   * @param message - A message providing additional information about the response.
   * @param statusCode - The HTTP status code associated with the response.
   *
   * @returns An ApiResponse instance with no data, a success status of false, and the provided error.
   */
  static fail(
    error: ApiError,
    message?: string,
    statusCode?: number,
  ): ApiResponse<null> {
    if(!message) message = error.message ?? "Failure";
    if(!statusCode) statusCode = error.statusCode ?? 500;
    return new ApiResponse(null, false, message, statusCode, error);
  }
}

export default ApiResponse;
