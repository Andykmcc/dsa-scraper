const jsdom = require('jsdom');
const promise = require('promise');
const path = require('path');
const url = require('url');
const _ = require('lodash');
const generate = require('csv-generate');
const stringify = promise.denodeify(require('csv-stringify'));
const writeFile = promise.denodeify(require('fs').writeFile);
const readdir = promise.denodeify(require('fs').readdir);
const chalk = require('chalk');
const emoji = require('node-emoji');

function getSavePath (location) {
  const name = url.parse(location).hostname;
  return path.resolve(`data/${name}.csv`);
}

function writeToCsv (saveLocation, data) {
  const generator = generate({objectMode: true, seed: 1, headers: 3});

  return stringify(data, {
    header: true,
    columns: _.keys(_.first(data))
  })
  .then(_.partial(writeFile, saveLocation, _, 'utf8'));
}

function saveData (location, data) {
  const saveLocation = getSavePath(location);
  return writeToCsv(saveLocation, data)
    .then(function () {
      _.flow(emoji.emojify, chalk.green, console.log)(`
        :dog:  FINISHED :dog:
        Your data is here: :arrow_right:  ${saveLocation} :arrow_left:
      `);
    })
    .catch(function(err){
      _.flow(chalk.red, console.log)(err);
    });
}

function processSite (site) {
  return new Promise(function (resolve, reject) {
    let jsDomOptions = _.pick(site, ['url', 'scripts']);

    jsDomOptions.done = function (err, window) {
      if (err) reject(err);

      saveData(site.url, site.parser(window))
      .then(resolve)
      .catch(reject);
    }

    jsdom.env(jsDomOptions);
  });
}

readdir(path.resolve('./src/sites'))
.then(function (files) {
  return files.map(function (fileName) {
    return require(path.resolve(`./src/sites/${fileName}`));
  });
})
.then(function (sites) {
  return Promise.all(sites.map(processSite));
})
.catch(function (err) {
  console.log(err)
});
