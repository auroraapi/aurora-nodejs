'use strict';

const BUF_SIZE = Math.pow(2, 10);
const MAX_THRESH = Math.pow(2, 14);
const SILENT_THRESH = Math.pow(2, 10);
const NUM_CHANNELS  = 1;
// const FORMAT = pyaudio.paInt16;
const RATE = 16000;

export = class AudioFile {
  // TODO
  constructor () {

  }

  // TODO
  writeToFile(fname) {

  }

  // TODO
  getWav() {

  }

  // TODO
  pad(seconds) {

  }

  // TODO
  pad_left(seconds) {

  }

  // TODO
  pad_right(seconds) {

  }

  // TODO
  trimSilent() {

  }

  // TODO
  play() {

  }

  // TODO
  stop() {

  }

  // TODO
  static fromRecording(length = 0, silenceLen = 0) {

  }

  // TODO
  static createFromWavData(d) {

  }

  // TODO
  static createFromFile(f) {

  }

  // TODO
  static createFromStream(s) {

  }

  // TODO
  static createFromHttpStream(s) {

  }
}

// TODO: implement IsSilent(data) <--- ???
