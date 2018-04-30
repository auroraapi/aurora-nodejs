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

### Text to Speech (TTS)

```Javascript
// Import the package
const aurora = require('auroraapi');

// Set your application settings
aurora.setAppId('YOUR_APP_ID'); // put your app ID here
aurora.setAppToken('YOUR_APP_TOKEN'); // put your app token here

// query the TTS service
let speech = aurora.Text('Hello world').speech();

// play the resulting audio
speech.audio.play();

// or save it to a file
speech.audio.writeToFile('test.wav');

```

### Speech to Text (STT)

#### Convert a WAV file to Speech

```Javascript
// import the package
const aurora = require('auroraapi');

// set your application settings
aurora.setAppId('YOUR_APP_ID'); // put your app ID here
aurora.setAppToken('YOUR_APP_TOKEN'); // put your app token here

// load a WAV file
let a = aurora.audio.AudioFile.createFromFile('test.wav');

let p = aurora.Speech(a).text();
console.log(p.text);
```

#### Convert a previous Text API call to Speech
```Javascript
// call the TTS API to convert "Hello world" to speech
let speech = aurora.Text('Hello world').speech();

// previous API returned a speech object, so we can just call
// the text() method to get a prediction
let p = speech.text();
console.log(p.text);
```

#### Listen for a specified amount of time
This is a PENDING feature and will be implemented at a later time

```Javascript
// listen for 3 seconds
let speech = aurora.Speech.listen(3000);

// convert to text
let p = speech.text();
console.log(p.text);
```

#### Listen for an unspecified amount of time
This is a PENDING feature and will be implemented at a later time

```Javascript
// start listening until 1.0 seconds of silence
let speech = aurora.Speech.listen();
// or specify your own silence timeout (0.5 seconds shown here)
// let speech = aurora.Speech.listen(silence_len=0.5)

// convert to text
let p = speech.text();
console.log(p.text); // prints the prediction
```

#### Continuously listen
This is a PENDING feature and will be implemented at a later time


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
