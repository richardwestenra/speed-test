# Speed Test

Run a speed test every ten minutes using Node.js and the [speedtest-net package](https://github.com/ddsol/speedtest.net), and log the results to a CSV.

## Usage
Clone the repository, install dependencies, and start it up:
```
git clone git@github.com:richardwestenra/speed-test.git
cd speed-test
npm install
npm start
```
Results are logged to data.csv. You can change the interval and the log file in index.js.

Running the app will start a web server to display the result in a chart, viewable at http://localhost:1337.