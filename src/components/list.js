/**
 * components/list.js
 *
 */

const orwell = require('lib/orwell');
const Prolefeed = require('prolefeed');
const Item = require('./item');

const List = React.createClass({

    propTypes: {
        tasksleftCursor: React.PropTypes.instanceOf(Prolefeed).isRequired,
        todosCursor: React.PropTypes.instanceOf(Prolefeed).isRequired,
        editingCursor: React.PropTypes.instanceOf(Prolefeed).isRequired,
        filterTodo: React.PropTypes.func.isRequired
    },

    render() {

        const {
            todosCursor,
            editingCursor,
            tasksleftCursor,
            filterTodo
        } = this.props;

        const todos = todosCursor.deref();

        if(todos.size <= 0) {
            return(
                <div />
            );
        }

        let todoItems = [];

        todos.forEach((record, key) => {
            if(filterTodo(record)) {
                return;
            }

            todoItems.push(
                <Item
                    recordCursor={todosCursor.cursor(key)}
                    editingCursor={editingCursor}
                    tasksleftCursor={tasksleftCursor}
                    key={record.get('key') + '.' + key}
                />
            );
        });
        return(
            <ul className="todo-list">
                {todoItems}
            </ul>
        );
    }
});

module.exports = orwell(List);
