import { Backend, CallParams, CallResponse } from ".";
import { APIError, AuroraError, ErrorCode } from "../../errors";
import { fromAnyToJSON } from "./util";

export const API_BASE_URL = "https://api.auroraapi.com/v1";
export const INTERPRET_PATH = "/interpret";
export const TTS_PATH = "/tts";
export const STT_PATH = "/stt";

/**
 * AuroraBackend is an implementation of the backend that sends requests
 * to the Aurora production server. This is used as the primary backend
 * and serves all actual requests.
 *
 * @version 0.1.0
 * @author [Nihil Kansal](http://github.com/nkansal96)
 */
export class AuroraBackend extends Backend {
  /**
   * Create the backend with the Aurora API endpoint
   */
  constructor(url: string = API_BASE_URL) {
    super(url);
  }

  /**
   * Create and execute a call to the Aurora backend. Upon success, it returns
   * the response from the backend (either as JSON or a stream). If the request
   * fails due to a backend error, an instance of `APIError` is thrown. If the
   * request fails due to a local error, an instance of `Error` is thrown.
   *
   * @param params parameters to call the backend with
   */
  public async call(params: CallParams): Promise<CallResponse> {
    const opts = {
      data: params.body,
      headers: {
        "X-Application-ID": params.credentials.appId || "",
        "X-Application-Token": params.credentials.appToken || "",
        "X-Device-ID": params.credentials.deviceID || "",
        ...(params.headers || {}),
      },
      method: params.method,
      params: params.query,
      responseType: params.responseType || "json",
      url: params.path,
    };

    try {
      const res = await this.http.request(opts);
      return res.data;
    } catch (err) {
      if (err.response) {
        // the response is always in JSON, but if its a stream, then
        // we need to read it before we can convert it to JSON
        const data = await fromAnyToJSON(err.response.data);
        throw APIError.fromJSON(data);
      }
      throw AuroraError.fromCode(ErrorCode.NetworkError, JSON.stringify(err.request));
    }
  }
}
