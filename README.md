# Aurora NodeJS SDK

## Overview

Aurora is the enterprise end-to-end speech solution. This Node SDK will allow you to quickly and easily use the Aurora service to integrate voice capabilities into your application.

The SDK is currently in a pre-alpha release phase. Bugs and limited functionality should be expected.

## Installation

**The Minimum NodeJS version is 6.x+**

### macOS

```
$ npm install auroraapi
```

### Linux

```
$ npm install auroraapi
```

If you're installing on Windows, you will likely need to install various production tools like Visual Studio compilers and compatible versions of Node in order to use one of the dependencies. Luckily, these are available conveniently in a npm package. Run the following as administrator. 

```
$ npm install --global --production windows-build-tools
$ npm install auroraapi
```

## Basic Usage

First, make sure you have an account with [Aurora](http://dashboard.auroraapi.com) and have created an Application.

Code examples can be found in the `examples` directory. You can run them directly by specifying the `APP_ID` and `APP_TOKEN` environment variables (or pasting them into the source directly). You'll also need to have [yarn](http://yarnpkg.org/en) installed and run `yarn build`.

This repository will show examples written using TypeScript, but you can also write them in plain ES6+. Here's a TypeScript example (with async/await):

```typescript
import aurora from "auroraapi";
import { Text } from "auroraapi/text";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

async function main() {
  const text = new Text("Hello World");
  const speech = await text.speech();
  await speech.audio.play();
}

try {
  main()
} catch (e) {
  console.error(e);
}
```

and the equivalent example in ES6 (with regular promises):

```javascript
const aurora = require('auroraapi');
const { Text } = require('auroraapi/text');

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

const text = new Text("Hello World!");
text.speech()
  .then(speech => speech.audio.play())
  .catch(console.error);
```

The rest of this section is more specific code examples that show the various functionality of the library and document its behavior.

### Text to Speech (TTS)

```Typescript
// Import the package
import aurora from "auroraapi";
import { Text } from "auroraapi/text";

// set your credentials
aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";
aurora.config.deviceID = "YOUR_DEVICE_ID"; // optional

(async function() {
  // query the TTS service
  const speech = await (new Text("Hello World")).speech();
  
  // play the resulting audio
  await speech.audio.play()

  // or save it to a file
  await speech.audio.writeToFile('hello_world.wav');
})();
```

### Speech to Text (STT)

#### Convert a WAV file to Speech

```typescript
import fs from 'fs';
import aurora from "auroraapi";
import { Speech } from "auroraapi/speech";
import { AudioFile } from "auroraapi/audio";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

(async function() {
  // load a WAV file
  const stream = fs.createReadStream('hello_world.wav')
  const audio = await AudioFile.fromStream(stream);
  
  // create a speech object from the audio and convert to text
  const text = await (new Speech(audio)).text();
  console.log(`Transcription: ${text.text}`);
})();
```

#### Convert a previous Text API call to Speech
```typescript
import aurora from "auroraapi";
import { Text } from "auroraapi/text";
import { AudioFile } from "auroraapi/audio";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

(async function() {
  // load a WAV file
  const speech = await (new Text("Hello world")).speech();

  // the previous API method returns a Speech object, so we can just call
  // the text() method to get a prediction
  let text = speech.text();
  console.log(`Transcription: ${text.text}`);
})();
```

#### Listen for a specified amount of time

```typescript
import aurora from "auroraapi";
import { listen, createDefaultListenParams } from "auroraapi/speech";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

(async function() {
  // listening requires some parameters. we have calibrated the defaults
  // so you should include them if you don't intend to override them. You
  // can do this by calling `createDefaultListenParams` to get the default
  // params, and then override the ones you want
  const params = createDefaultListenParams();
  // listen for 3 seconds, ignoring leading silence
  // setting `length` overrides the other setting (`silenceLen`), which 
  // listens until a period of consecutive silence. This detail will be
  // explored in the next example.
  params.length = 3.0;
  const speech = await listen(params)

  // convert the recorded speech to text
  let text = speech.text();
  console.log(`Transcription: ${text.text}`);
})();
```

#### Listen for an unspecified amount of time

```Typescript
import aurora from "auroraapi";
import { listen, createDefaultListenParams } from "auroraapi/speech";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

(async function() {
  const params = createDefaultListenParams();
  // listen until there is 0.5 seconds of continuous silence, not including
  // any leading silence. Note that this property is not taken into account
  // if `length` is non-zero.
  params.silenceLen = 0.5;
  const speech = await listen(params)

  // convert the recorded speech to text
  let text = speech.text();
  console.log(`Transcription: ${text.text}`);
})();
```

#### Continuously listen

Continuously listen and retrieve speech segments. Note: you can do anything with these speech segments, but here we'll convert them to text. Just like the previous example, these segments are demarcated by silence (1.0 second by default) and can be changed by passing the `silenceLen` parameter. Additionally, you can make these segments fixed length (as in the example before the previous) by setting the `length` parameter.

```Typescript
import aurora from "auroraapi";
import {
  Speech,
  continuouslyListen,
  createDefaultListenParams
} from "auroraapi/speech";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

/**
 * This callback is used to handle each Speech object generated by 
 * `continuouslyListen`.
 */
const listenHandler = (speech?: Speech, error?: Error) => {
  if (error || !speech) {
    return false;
  }
  
  // asyncronously convert to text, log it, and continue listening
  speech.text()
    .then(text => console.log(`Transcript: ${text.text}`))
    .catch(console.error);
  return true;
};

/**
 * Continuously listen and generate `Speech` objects. Discarding leading silence,
 * this will listen for up to 1s of consecutive silence and then pass
 * each resulting `Speech` object to the callback. This will continue to do
 * this until the callback returns false.
 */
(async function() {
  const params = createDefaultListenParams();
  await continuouslyListen(params, listenHandler)
})();

/**
 * Same as above, but this one will only listen for up to 0.5s of 
 * consecutive silence
 */
(async function() {
  const params = createDefaultListenParams();
  params.silenceLen = 0.5;
  await continuouslyListen(params, listenHandler)
})();

/**
 * Same as the first one, except instead of listening for 1s of 
 * consecutive silence, it will listen for a fixed period of 3 seconds
 * not including any leading silence.
 */
(async function() {
  const params = createDefaultListenParams();
  params.length = 3.0;
  await continuouslyListen(params, listenHandler)
})();
```

#### Listen and Transcribe

If you already know that you wanted the recorded speech to be converted to text, you can do it in one step, reducing the amount of code you need to write and also reducing latency. Using the `ListenAndTranscribe` method, the audio that is recorded automatically starts uploading as soon as you call the method and transcription begins. When the audio recording ends, you get back the final transcription.

```typescript
import aurora from "auroraapi";
import { Text } from "auroraapi/text";
import {
  createDefaultListenParams,
  listenAndTranscribe,
  continuouslyListenAndTranscribe,
} from "auroraapi/speech";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

/**
 * This callback is used to handle each Text object generated by 
 * `continuouslyListenAndTranscribe`.
 */
const listenHandler = (text?: Text, error?: Error) => {
  if (error || !text) {
    return false;
  }
  
  console.log(`Transcript: ${text.text}`);
  return true;
};

/**
 * Continuously listen and convert to text. Discarding leading silence,
 * this will listen for up to 1s of consecutive silence and simultaneously
 * stream the audio to the Aurora API server. Once the function signals the
 * end of the audio, the transcript will be immediately available to the 
 * callback function. The function stops when the callback returns false;
 */
(async function() {
  const params = createDefaultListenParams();
  
  // use this one to listen and transcribe once
  const text = await listenAndTranscribe();
  
  // use this one to continuously listen and transcribe
  await continuouslyListenAndTranscribe(params, listenHandler)
})();
```

#### Listen and echo example

```typescript
import aurora from "auroraapi";
import { Text } from "auroraapi/text";
import {
  createDefaultListenParams,
  continuouslyListenAndTranscribe,
} from "auroraapi/speech";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

/**
 * This callback is used to handle each Text object generated by 
 * `continuouslyListenAndTranscribe`.
 */
const listenHandler = (text?: Text, error?: Error) => {
  if (error || !text) {
    return false;
  }
  
  // convert each transcribed speech segment back to speech and play
  // the resulting audio.
  text.speech()
    .then(s => s.audio.play())
    .catch(console.error);
  return true;
};

/**
 * Continuously listen and convert to text. Discarding leading silence,
 * this will listen for up to 1s of consecutive silence and simultaneously
 * stream the audio to the Aurora API server. Once the function signals the
 * end of the audio, the transcript will be immediately available to the 
 * callback function. The function stops when the callback returns false;
 */
(async function() {
  const params = createDefaultListenParams();
  await continuouslyListenAndTranscribe(params, listenHandler)
})();
```

### Interpret (Language Understanding)

The interpret service allows you to take any Aurora `Text` object and understand the user's intent and extract additional query information. Interpret can only be called on `Text` objects and return `Interpret` objects after completion. To convert a user's speech into and `Interpret` object, it must be converted to text first.

#### Basic example

```Javascript
import aurora from "auroraapi";
import { Text } from "auroraapi/text";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

(async function() {
  // create a Text object
  const text = new Text("what is the time in los angeles");

  // call the interpret service. This returns an "Interpret" object
  const i = await text.interpret();

  // get the user's intent
  console.log(i.intent); // time

  // get any additional information
  console.log(i.entities); // { "location": "los angeles" }
})();
```

#### User query example

```Javascript
// requires synchronous readline npm package
const readlineSync = require('readline-sync');

(async function() {
  while (true){
  // repeatedly ask the user to enter a command
  const text = readlineSync.question('Enter a command: ');
  if (text.localeCompare('quit') == 0){
    break;
  }

  // interpret and print the results
  const i = await (new Text(text)).interpret();
  console.log(i.intent, i.entities);
  }
})();

```

#### Smart Lamp

This example shows how easy it is to voice-enable a smart lamp. It responds to queries in the form of "turn on the lights" or "turn off the lamp". You define what `object` you're listening for (so that you can ignore queries like "turn on the music").

```Typescript
import aurora from "auroraapi";
import { Text } from "auroraapi/text";
import { Interpret } from "auroraapi/interpret";
import {
  createDefaultListenParams,
  continuouslyListenAndTranscribe,
} from "auroraapi/speech";

aurora.config.appId    = "YOUR_APP_ID";
aurora.config.appToken = "YOUR_APP_TOKEN";

// define the valid trigger words
const validWords = ['light', 'lights', 'lamp'];
const validEntities = d => !!d.object && validWords.includes(d.object);

const handleAction = (i: Interpret) => {
  if (i.intent === "turn_off" && validEntities(i.entities)) {
    // do something to actually turn off the lamp
    console.log("turning off the lamp");
  } else if (i.intent === "turn_on" && validEntities(i.entities)) {
    // do something to actually turn on the lamp
    console.log("turning on the lamp");
  }
};

const listenHandler = (text?: Text, error?: Error) => {
  if (error || !text) {
    return false;
  }
  
  text.interpret()
    .then(handleAction)
    .catch(console.error);
  return true;
};

(async function() {
  const params = createDefaultListenParams();
  await continuouslyListenAndTranscribe(params, listenHandler)
})();
```
