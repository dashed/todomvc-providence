/**
 * components/list.js
 *
 */

const PureRenderMixin = require('react/addons').addons.PureRenderMixin;

const orwell = require('lib/orwell');
const Structure = require('lib/immstruct').Structure;
const Item = require('./item');

const List = React.createClass({

    propTypes: {
        tasksleftCursor: React.PropTypes.instanceOf(Structure).isRequired,
        todosCursor: React.PropTypes.instanceOf(Structure).isRequired,
        editingCursor: React.PropTypes.instanceOf(Structure).isRequired,
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
