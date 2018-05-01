import { Map } from "../common";
import { ErrorCode, ErrorMessages } from "./codes";

export { ErrorCode };

/**
 * AuroraError is an error that occurred on the client-side. It contains
 * helpful information to help you debug what went wrong.
 *
 * @author [Nikhil Kansal](https://github.com/nkansal96)
 * @version 1.0.0
 */
export class AuroraError extends Error {
  /** A unique code that describes the error */
  public code: string;
  /** A user-friendly description of what went wrong and how to fix it */
  public message: string;
  /** More technical information about the problem that occurred */
  public info: string;

  /**
   * Creates an AuroraError from the given information
   *
   * @param code error code
   * @param message user-friendly error message
   * @param info technical information about the error
   */
  constructor(code: string, message: string, info: string = "") {
    super(message);
    this.code = code;
    this.message = message;
    this.info = info;
  }

  /**
   * Creates an AuroraError based on a pre-defined error code.
   *
   * @param code the error code
   * @param info additional information about the error
   */
  public static fromCode(code: ErrorCode, info: string = "") {
    return new AuroraError(code, ErrorMessages[code], info);
  }
}

/**
 * APIError is an error that resulted on the API side (i.e. returned directly
 * from the server). It defines a few additional fields on top of the base
 * AuroraError.
 *
 * @author [Nikhil Kansal](https://github.com/nkansal96)
 * @version 1.0.0
 */
export class APIError extends AuroraError {
  /** The request ID that caused this error */
  public id: string;
  /** The type of error (a string representation of the HTTP status code, like BadRequest) */
  public type: string;
  /** The HTTP status code (like 400) */
  public status: number;

  /**
   * Creates an APIError from the fields returned from an error response from
   * the API.
   *
   * @param code a unique code that describes this error
   * @param message a user-friendly error message that describes what went wrong and hwo to fix it
   * @param id the request ID that caused the error
   * @param type a string representation of the resulting HTTP status (like BadRequest)
   * @param status the HTTP status code (like 400)
   * @param info additional technical information that would be helpful for debugging
   */
  constructor(code: string, message: string, id: string, type: string, status: number, info: string = "") {
    super(code, message, info);
    this.id = id;
    this.type = type;
    this.status = status;
  }

  /**
   * Takes an object returned by the server, deconstructs its individual fields,
   * and creates and APIError.
   *
   * @param json data returned by the server
   */
  public static fromJSON(json: Map<any>) {
    return new APIError(
      json.code,
      json.message,
      json.id,
      json.type,
      json.status,
      json.info,
    );
  }
}
