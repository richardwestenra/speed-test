const fs = require('fs');
const speedTest = require('speedtest-net');

process.env["HTTP_PROXY"] =  process.env["http_proxy"] = "http://proxy:3128";

const time = () => new Date().toISOString();

const appendData = (data, index) => {
  const now = time();
  const newDatum = `\n${now}, ${data.speeds.download}, ${data.speeds.upload}`;

  fs.appendFile('data.csv', newDatum, function (error) {
    if (error) throw error;
    console.log(`Saved to file ${index} (${now})`);
  });
};

const run = index => {
  console.log(`Run new test ${index} (${time()})`);
  const test = speedTest({ maxTime: 5000 });

  test.on('data', data => {
    appendData(data, index);
    setTimeout(run.bind(this, index + 1), 10 * 60 * 1000);
  });

  test.on('error', err => {
    console.error(err);
  });
};

run(1);

// Keep alive for 24 hours
setTimeout(console.log, 24 * 60 * 60 * 1000);