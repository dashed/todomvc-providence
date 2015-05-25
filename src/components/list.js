/**
 * components/list.js
 *
 */

const orwell = require('orwell');
const Probe = require('minitrue').Probe;
const Item = require('./item');

const List = React.createClass({

    propTypes: {
        todosCursor: React.PropTypes.instanceOf(Probe).isRequired,
        editingCursor: React.PropTypes.instanceOf(Probe).isRequired,
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
                    key={record.get('id') + '.' + key}
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
