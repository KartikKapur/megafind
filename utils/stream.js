const record = require('node-record-lpcm16');
const Speech = require('@google-cloud/speech');

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

class Stream {

  constructor() {
      this.speech = Speech();
      this.request = {
        config: {
          encoding,
          sampleRateHertz,
          languageCode
        },
        interimResults: false // If you want interim results, set this to true
      };
      this.recognizeStream = this.speech.streamingRecognize(this.request)
        .on('error', console.error)
        .on('data', (data) =>
            process.stdout.write(
              (data.results[0] && data.results[0].alternatives[0])
                ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                : `\n\nReached transcription time limit, press Ctrl+C\n`));
  }

  startRecording() {
      // Start recording and send the microphone input to the Speech API
      record
        .start({
          sampleRateHertz,
          threshold: 0,
          // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
          verbose: false,
          recordProgram: 'rec' // Try also "arecord" or "sox"
        })
        .on('error', console.error)
        .pipe(this.recognizeStream);

      setTimeout(function () {
        record.stop()
      }, 10000);
      return;
  };

}

module.exports = Stream;