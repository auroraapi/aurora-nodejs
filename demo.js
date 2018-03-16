let aurora = require('./index.js');
let privateKeys = require('./test/private').keys;

// A basic demo of roboticizing someone's voice by converting their 
// voice from speech to text, then back to speech. 

// Set application keys
aurora.setAppId(privateKeys.appId);
aurora.setAppToken(privateKeys.appToken);
aurora.setDeviceId(privateKeys.deviceId);

// Listen using the default audio input until 3 seconds of silence occur, 
// then return a promise with the Speech result.
aurora.Speech.listen(0, 3)
.then((speechObject) => {
	console.log("Playing speech to confirm what we heard...");
	return speechObject.audio.play()
	.then(() => {
		return speechObject;
	});
})
.then((speechObject) => {
	console.log("Done recording speech! Converting into text...");
	// Convert the received speech to text.
	return speechObject.text();
})
.then((textObject) => {
	if (textObject.text) {
		console.log("Done converting! Converting into speech...");
		console.log("    Heard: " + textObject.text);
		console.log("    Converting into speech...");
		// Convert the text object back to speech.
		return textObject.speech()
		.then((roboticizedSpeech) => {
			console.log("Done converting to speech! Playing...");
			// Play the speech.
			return roboticizedSpeech.audio.play();
		})
		.then(() => {
			console.log("Done playing!");
		})
	}
	else {
		console.log("Couldn't hear you! Try again...");
		return null;
	}
})
.catch((error) => {
	console.log(error.stack);
});