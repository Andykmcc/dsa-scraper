const _ = require('lodash');

function parser (window) {
  const $ = window.$;
  const allTableRows = $(window.document).find('#content table:eq(1)').find('tr');
  const headlessTableRows = _.drop(allTableRows, 4);

  return _.chain(headlessTableRows)
    .map(function (row){
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

module.exports = {
  url: 'http://www.cadem.org/our-party/adem/assembly-district-meetings/ad-17',
  scripts: ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'],
  parser: parser
};
