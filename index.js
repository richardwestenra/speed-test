const fs = require('fs');
const speedTest = require('speedtest-net');
process.env['HTTP_PROXY'] =  process.env['http_proxy'] = 'http://proxy:3128';

const interval = 10; // minutes
const destination = 'data.csv'; // data log file

const time = () => new Date().toISOString();

const minsToMs = m => m * 60 * 1000;

const appendData = (data, index) => {
  const now = time();
  const newDatum = `\n${now}, ${data.speeds.download}, ${data.speeds.upload}`;

  fs.appendFile(destination, newDatum, function (error) {
    if (error) throw error;
    console.log(`Saved to file ${index} - ${now}`);
  });
};

// Run a new test
const run = index => {
  console.log(`Run new test ${index} - ${time()}`);
  const test = speedTest({ maxTime: 5000 });

  test.on('data', data => {
    appendData(data, index);
    setTimeout(run.bind(this, index + 1), minsToMs(interval));
  });

  test.on('error', console.error);
};

run(1);