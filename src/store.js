/**
 * store.js
 *
 */

const immstruct = require('lib/immstruct');

module.exports = immstruct({
    todos: [],
    editing: null,
    tasksleft: 0
});
