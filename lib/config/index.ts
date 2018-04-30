import { Backend } from "../api/backend";
import { AuroraBackend } from "../api/backend/aurora";

/**
 * Configuration for the SDK.
 *
 * @version 0.0.1
 * @author [Nikhil Kansal](https://github.com/nkansal96)
 */
export class Config {
  /**
   * (required) The application ID. This field is sent to the Aurora API
   * as the 'X-Application-ID' header.
   */
  public appId?: string;
  /**
   * (required) The application token. This field is sent to the Aurora
   * API as the 'X-Application-Token' header.
   */
  public appToken?: string;
  /**
   * (optional) The unique device ID. This field is sent to the Aurora API
   * as the 'X-Device-ID' header. To generate meaningful analytics, you should
   * ensure that this is unique across all devices and decribes the device
   * over its entire lifetime.
   */
  public deviceId?: string;

  /**
   * The backend to use for the API calls. By default, this is configured
   * to reach the Aurora backend, but can be switched out for testing or
   * local deployments.
   */
  public backend: Backend = new AuroraBackend();
}

/**
 * The default instance of the configuration, used by the SDK.
 */
export const config = new Config();
