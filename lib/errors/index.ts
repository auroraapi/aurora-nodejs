import { Map } from "../common";

export class AuroraError extends Error {
  public code: string;
  public message: string;
  public info: string;

  constructor(code: string, message: string, info: string = "") {
    super(message);
    this.code = code;
    this.message = message;
    this.info = info;
  }
}

export class APIError extends AuroraError {
  public id: string;
  public type: string;
  public status: number;

  constructor(code: string, message: string, id: string, type: string, status: number, info: string = "") {
    super(code, message, info);
    this.id = id;
    this.type = type;
    this.status = status;
  }

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
