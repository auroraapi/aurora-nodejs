import { Map } from "../common";

/**
 * Error codes denoting particular types of errors that can occurr
 */
export enum ErrorCode {
  /** Occurs when an invalid argument is specified to the AudioFile constructor */
  InvalidAudioType = "InvalidAudioType",
  /** Occurs when a network connection to the backend could not be established */
  NetworkError = "NetworkError",
  /** Occurs when a stream is being read into a WAV file but the read fails */
  WAVBrokenStream = "WAVBrokenStream",
}

/* tslint:disable:max-line-length */

/**
 * Mapping of error codes to textual messages
 */
export const ErrorMessages = {
  [ErrorCode.InvalidAudioType]: "An invalid type was passed to the AudioFile constructor. You can either pass a WAV or a Buffer.",
  [ErrorCode.NetworkError]: "Unable to reach the Aurora API server. Check your network connection and settings.",
  [ErrorCode.WAVBrokenStream]: "An error occurred while reading the stream data.",
};
