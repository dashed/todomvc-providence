/**
 * store.js
 *
 */

const NOT_SET = {};

const minitrue = require('minitrue');

const store = minitrue({
    todos: [],
    editing: null,
    tasksleft: 0
});

const tasksleftCursor = store.cursor('tasksleft');

store.cursor('todos').on('update', function(newTodo, oldTodo, pathToChange) {

    if(!Array.isArray(pathToChange)) {
        return;
    }

    const oldRecord = oldTodo.getIn(pathToChange);

    // case: deleted
    if(newTodo.size < oldTodo.size) {
        if(!oldRecord.get('completed')) {
            tasksleftCursor.update(x => x - 1);
        }
        return;
    }

    const record = newTodo.getIn(pathToChange);

    if(record.get('completed') === oldRecord.get('completed')) {
        return;
    }

    return tasksleftCursor.update(x => x + (record.get('completed') ? -1 : 1));
});

module.exports = store;
