/**
 * components/header.js
 *
 */

const PureRenderMixin = require('react/addons').addons.PureRenderMixin;

const Probe = require('minitrue').Probe;
const TodoModel = require('models/todo');
const ENTER_KEY = 13;

module.exports = React.createClass({

    mixins: [PureRenderMixin],

    contextTypes: {
        rootCursor: React.PropTypes.instanceOf(Probe).isRequired
    },

    handleAddTodo(event) {

        if(event.which !== ENTER_KEY) {
            return;
        }

        const node = this.refs.addTodo.getDOMNode();
        const task = node.value.trim();
        if(task.length <= 0) {
            return;
        }

        event.preventDefault();

        node.value = '';

        const todoitem = TodoModel.create(task);

        const rootCursor = this.context.rootCursor;
        // add new task
        const list = rootCursor.cursor('todos');
        list.update(x => {
            return x.push(todoitem);
        });

        rootCursor.cursor('tasksleft').update(x => x + 1);
    },

    render() {
        return(
            <header className="header">
                <h1>todos</h1>
                <input
                    ref="addTodo"
                    className="new-todo"
                    placeholder="What needs to be done?"
                    onKeyDown={this.handleAddTodo}
                    autoFocus={true} />
            </header>
        );
    }
});
