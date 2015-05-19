/**
 * components/completed.js
 *
 */

const FilterList = require('./filter');

module.exports = FilterList(record => !record.get('completed'));
