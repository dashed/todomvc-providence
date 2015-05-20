/**
 * store.js
 *
 */

const minitrue = require('minitrue');

module.exports = minitrue({
    todos: [],
    editing: null,
    tasksleft: 0
});
