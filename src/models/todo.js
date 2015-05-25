/**
 * models/todo.js
 *
 */

const { Record } = require('immutable');
const TodoItem = Record({
    id: 0,
    completed: false,
    task: ''
});

let id = 0;

module.exports = {

    // expose record constructor
    TodoItem: TodoItem,

    create(task) {
        return new TodoItem({
            task: task,
            id: id++
        });
    }
};
