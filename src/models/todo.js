/**
 * models/todo.js
 *
 */

const { Record } = require('immutable');
const TodoItem = Record({
    key: 0,
    completed: false,
    task: ''
});

let key = 0;

module.exports = {

    // expose record constructor
    TodoItem: TodoItem,

    create(task) {
        return new TodoItem({
            task: task,
            key: key++
        });
    }
};
