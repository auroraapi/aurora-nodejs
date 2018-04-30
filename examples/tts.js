const aurora = require('../dist/index');
const { Text } = require('../dist/text');

// Set application keys
aurora.config.appId    = process.env.APP_ID;
aurora.config.appToken = process.env.APP_TOKEN;
aurora.config.deviceId = process.env.DEVICE_ID;

// create a Text object, convert it to speech, and play the audio
const text = new Text("Hello world");
text.speech()
	.then(s => s.audio.play())
	.catch(console.error);
