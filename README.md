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
	// listen for 3 seconds, ignoring trailing silence
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
	// any trailing silence. Note that this property is not taken into account
	// if `length` is non-zero.
	params.silenceLen = 0.5;
	const speech = await listen(params)

	// convert the recorded speech to text
	let text = speech.text();
	console.log(`Transcription: ${text.text}`);
})();
```

#### Continuously listen

Continuously listen and retrieve speech segments. Note: you can do anything with these speech segments, but here we'll convert them to text. Just like the previous example, these segments are demarcated by silence (1.0 second by default) and can be changed by passing the `silence_len` parameter. Additionally, you can make these segments fixed length (as in the example before the previous) by setting the `length` parameter.

```Javascript
// continuously listen and convert to speech (blocking example)
// TODO

// reduce the amount of silence in between speech segments
// TODO

// fixed length speech segments of 3 seconds
// TODO
```

### Interpret (Language Understanding)

The interpret service allows you to take any Aurora `Text` object and understand the user's intent and extract additional query information. Interpret can only be called on `Text` objects and return `Interpret` objects after completion. To convert a user's speech into and `Interpret` object, it must be converted to text first.

#### Basic example

```Javascript
// create a Text object
let text = aurora.Text('what is the time in los angeles');

// call the interpret service. This returns an "Interpret" object
let i = text.interpret();

// get the user's intent
console.log(i.intent); // time

// get any additional information
console.log(i.entities); // { "location": "los angeles" }
```

#### User query example

```Javascript
// requires synchronous readline npm package
const readlineSync = requier('readline-sync');

while (true){
	// repeatedly ask the user to enter a command
	let userText = readlineSync.question('Enter a command: ');
	if(userText.localeCompare('quit') == 0){
		break;
	}

	// interpret and print the results
	let i = aurora.Text(userText).interpret();
	console.log(i.intent, i.entities);
}
```

#### Smart Lamp
This example relies on PENDING features


This example shows how easy it is to voice-enable a smart lamp. It responds to queries in the form of "turn on the lights" or "turn off the lamp". You define what `object` you're listening for (so that you can ignore queries like "turn on the music").

```Javascript
let validWords = ['light', 'lights', 'lamp'];
let validEntities = (d) =>
	d.hasOwnProperty('object') && validWords.indexOf(d['object']) != -1;

// TODO (continuously listen stuff)
```
