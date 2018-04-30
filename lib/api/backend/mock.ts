import { Backend, CallParams, CallResponse } from ".";
import { APIError, AuroraError } from "../../errors";
import { fromAnyToJSON } from "./util";

/**
 * MockBackend is an implementation of the backend that just mimics
 * a call response based on the information it was instantiated with.
 *
 * @version 0.1.0
 * @author [Nihil Kansal](http://github.com/nkansal96)
 */
export class MockBackend extends Backend {
  private response: CallResponse;
  private status: number;

  /**
   * Create the backend so that it appears to have been called with the
   * given information.
   *
   * @param status the HTTP status code to return with. The call() method will throw if this is >= 400
   * @param response the response to return upon success, or the error to throw with (should be a subclass of Error)
   */
  constructor(response: CallResponse, status: number = 200) {
    // this doesn't matter since we won't use the axios client
    super("");
    this.response = response;
    this.status = status;
  }

  /**
   * Pretend to create and execute a call to the actual backend. It actually
   * just returns the information it was set up with.
   *
   * @param params parameters to call the backend with
   */
  public async call(params: CallParams): Promise<CallResponse> {
    if (this.status >= 400) {
      throw this.response;
    }
    return this.response;
  }
}
