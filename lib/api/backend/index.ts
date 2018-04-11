import axios, { AxiosInstance } from "axios";
import { Readable } from "stream";
import { Map } from "../../common";

/**
 * HTTP Methods
 */
export enum Method {
  GET = "GET",
  PUT = "PUT",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

/**
 * Credentials to send to Aurora.
 */
export interface Credentials {
  /**
   * The ID of the application ('X-Application-ID' header)
   */
  appId?: string;
  /**
   * The application token ('X-Application-Token' header)
   */
  appToken?: string;
  /**
   * The unique device ID ('X-Device-ID' header)
   */
  deviceID?: string;
}

/**
 * Parameters to call the backend with
 */
export interface CallParams {
  /** HTTP method */
  method: Method;
  /** The path relative to the http client base URL */
  path: string;
  /** The authentication credentials */
  credentials: Credentials;
  /** Additional headers to send (besides authentication) */
  headers?: Map<string>;
  /**
   * The body to send. This can be JSON, a stream, a buffer, etc.
   * Setting this does not automatically set the method.
   */
  body?: any;
  /** Multipart form values to send */
  form?: Map<string>;
  /** Query-string paramters to be encoded */
  query?: Map<string>;
  /** Expected response type (JSON by default) */
  responseType?: string;
}

/**
 * Response type from the API. For audio responses, it will return a stream
 * or buffer. For all other response, it will be JSON.
 */
export type CallResponse = Readable | Buffer | Map<any>;

/**
 * The general backend class used to query an Aurora backend. An implementation
 * must fill out the call method, which actually executes the HTTP request.
 *
 * @version 0.1.0
 * @author [Nikhil Kansal](http://github.com/nkansal96)
 */
export default abstract class Backend {
  /** the axios http client */
  protected http: AxiosInstance;

  /**
   * Creates the http client using the given base URL
   *
   * @param baseURL the base URL to use for requests
   */
  constructor(baseURL: string) {
    this.http = axios.create({
      baseURL,
      timeout: 60000,
    });
  }

  /**
   * Calls the backend with the given parameters.
   *
   * @param params the parameters to call the backend with
   */
  public abstract async call(params: CallParams): Promise<CallResponse>;
}
