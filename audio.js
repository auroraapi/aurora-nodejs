'use strict';

const fs = require("fs");
const portAudio = require("naudiodon");

const BUF_SIZE = Math.pow(2, 10);
const MAX_THRESH = Math.pow(2, 14);
const SILENT_THRESH = Math.pow(2, 10);
const NUM_CHANNELS = 2; // 1
const FORMAT = portAudio.SampleFormat16Bit;  //portAudio.paInt16;
const RATE = 44100;

module.exports = class AudioFile {
  // TODO
  constructor(audio) {
    this.audio = audio;
    this.shouldStop = false;
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
<<<<<<< HEAD
  static fromRecording(length = 0, silenceLen = 0) {

=======
  static fromRecording(length = 0, silenceLen = 1.0) {
    let ai = new portAudio.AudioInput({
      channelCount: NUM_CHANNELS,
      sampleFormat: FORMAT,
      sampleRate: RATE,
      deviceId: -1 // default device
    });

    ai.on('error', err => console.error);

    // create write stream to write out to raw audio file
    let ws = fs.createWriteStream('rawAudio.raw');

    ai.pipe(ws);
    ai.start();

    setTimeout(function (){
      ai.quit();
    }, length);
>>>>>>> 53d8d6a1edf7e950a45448dcd3174a1a822adead
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
<<<<<<< HEAD
}
=======
};
>>>>>>> 53d8d6a1edf7e950a45448dcd3174a1a822adead

// TODO: implement IsSilent(data) <--- ???
