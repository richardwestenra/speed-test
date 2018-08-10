const interval = 10; // minutes
const destination = 'data.csv'; // data log file

const fs = require('fs');
const speedTest = require('speedtest-net');
process.env['HTTP_PROXY'] =  process.env['http_proxy'] = 'http://proxy:3128';
const express = require('express');

// Get current datetime
const time = () => new Date().toISOString();

// Convert minutes to milliseconds
const minsToMs = m => m * 60 * 1000;

// Run dataviz web server
const app = express();
app.use(express.static(__dirname));
app.listen(1337);
console.log('Report server is running at http://localhost:1337');

// Append new line to data file
const appendData = (data, index) => {
  const now = time();
  const newDatum = `\n${now},${data.speeds.download},${data.speeds.upload}`;

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

// Init
run(1);