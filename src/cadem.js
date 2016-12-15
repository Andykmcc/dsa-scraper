const promise = require('promise');
const path = require('path');
const _ = require('lodash');
const generate = require('csv-generate');
const stringify = promise.denodeify(require('csv-stringify'));
const writeFile = promise.denodeify(require('fs').writeFile);
const chalk = require('chalk');
const emoji = require('node-emoji');

function getSavePath (name) {
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

function caDemsDataProcessor (window) {
  const $ = window.$;
  const tableRows = _.drop($(window.document).find('#content table:eq(1)').find('tr'), 4);

  return _.chain(tableRows)
    .map(function(row){
      const $row = $(row);
      return {
        name: $row.find('td:eq(0)').text().trim(),
        gender: $row.find('td:eq(2)').text().trim(),
        statement: $row.find('td:eq(4) p').text().trim()
      }
    })
    .compact()
    .filter(function(row){
      return row.name.length || row.gender.length || row.name.statement;
    })
    .value();
}

function doneCallback (err, window) {
  if(err) throw err;

  const saveLocation = getSavePath('cadem');
  const data = caDemsDataProcessor(window);

  return writeToCsv(saveLocation, data)
    .then(function () {
      const done = ('');
      _.flow(emoji.emojify, chalk.green, console.log)(`
        :dog:  FINISHED :dog:
        Your data is here: :arrow_right:  ${saveLocation} :arrow_left:
      `);
    })
    .catch(function(err){
      _.flow(chalk.red, console.log)(err);
    });
}

module.exports = {
  url: 'http://www.cadem.org/our-party/adem/assembly-district-meetings/ad-17',
  scripts: ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'],
  done: doneCallback
};
