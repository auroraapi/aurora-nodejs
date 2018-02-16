'use strict';

let fs = require("fs");
let portAudio = require("naudiodon");
let wav = require("wav");

const BUF_SIZE = Math.pow(2, 10);
const MAX_THRESH = Math.pow(2, 14);
const SILENT_THRESH = Math.pow(2, 10);
const NUM_CHANNELS = 2; // 1
const FORMAT = portAudio.SampleFormat16Bit;  //portAudio.paInt16;
const RATE = 44100;

module.exports = class AudioFile {
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
  getWavPath(){
    return 'test.wav'; // dummy implementation
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

  // TODO: Modify so sound data is stored in class
  play() {
    let ao = new portAudio.AudioOutput({
      channelCount: NUM_CHANNELS,
      sampleFormat: FORMAT,
      sampleRate: RATE,
      deviceId: -1 // default device
    });

    ao.on('error', err => console.error);

    let rs = fs.createReadStream('rawAudio.raw');

    // close output stream at end of read stream
    rs.on('end', () => ao.end());

    rs.pipe(ao);
    ao.start();
  }

  // TODO
  stop() {

  }

  static fromRecording(length = 0, silenceLen = 1.0) {
    let ai = new portAudio.AudioInput({
      channelCount: NUM_CHANNELS,
      sampleFormat: FORMAT,
      sampleRate: RATE,
      deviceId: -1 // default device
    });

    ai.on('error', err => console.error);

    // Create a wave writer that helps to encode raw audio.
    let wavWriter = new wav.Writer({
      channels: NUM_CHANNELS,
      sampleRate: RATE,
      bitDepth: FORMAT
    });

    // create write stream to write out to raw audio file
    let ws = fs.createWriteStream('rawAudio.wav');

    ai.pipe(wavWriter);
    wavWriter.pipe(ws);
    ai.start();

    setTimeout(function (){
      ai.quit();
    }, length);
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
};

// TODO: implement IsSilent(data) <--- ???
