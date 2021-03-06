/**
 * components/main.js
 *
 */

const { RouteHandler } = require('react-router');

const orwell = require('orwell');
const Probe = require('minitrue').Probe;

const Main = React.createClass({

    propTypes: {
        rootCursor: React.PropTypes.instanceOf(Probe).isRequired,
        tasksleftCursor: React.PropTypes.instanceOf(Probe).isRequired,
        todosCursor: React.PropTypes.instanceOf(Probe).isRequired,
        checked: React.PropTypes.bool.isRequired
    },

    toggleTodos(event) {
        event.stopPropagation();

        const newCompleteVal = !this.props.checked;
        this.props.todosCursor.update(function(todos) {
            return todos.map(function(record) {
                return record.set('completed', newCompleteVal);
            });
        });

        const tasksleft = newCompleteVal ? 0 : this.props.todosCursor.deref().size;
        this.props.tasksleftCursor.update(_ => tasksleft);
    },

    render: function () {
        let toggle = null;
        if(this.props.todosCursor.deref().size > 0) {
            toggle = [
                <input key={1} className="toggle-all" type="checkbox" onChange={this.toggleTodos} checked={this.props.checked} />,
                <label key={2} htmlFor="toggle-all">Mark all as complete</label>
            ];
        }

        return(
            <section className="main">
                {toggle}
                <RouteHandler {...this.props} />
            </section>
        );
    }
});

function watchCursors({ tasksleftCursor, todosCursor }) {
    return [tasksleftCursor, todosCursor];
}

function assignNewProps({ tasksleftCursor, todosCursor }) {
    return {
        checked: tasksleftCursor.deref() <= 0 && todosCursor.deref().size > 0,
        todos: todosCursor.deref()
    };
}

module.exports = orwell(Main, watchCursors, assignNewProps);
