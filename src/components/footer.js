/**
 * components/footer.js
 *
 */

const
Router = require('react-router'),
{
    Link
} = Router;

const orwell = require('orwell');
const Probe = require('minitrue').Probe;

const {List} = require('immutable');

const Footer = React.createClass({

    propTypes: {
        tasksleft: React.PropTypes.number.isRequired,
        todos: React.PropTypes.instanceOf(Immutable.List).isRequired,
        todosCursor: React.PropTypes.instanceOf(Probe).isRequired,
        tasksleftCursor: React.PropTypes.instanceOf(Probe).isRequired
    },

    clearCompleted() {
        this.props.todosCursor.update(function(todos) {
            return todos.filterNot(function(record) {
                return record.get('completed');
            });
        });
    },

    render() {
        // console.log(this.props.todos instanceof Immutable.List);
        const count = this.props.tasksleft;

        if(this.props.todos.size <= 0) {
            return(<div/>);
        }

        const itemWord = count > 1 ? 'items' : 'item';

        let clearButton = null;
        if((this.props.todos.size - count) > 0) {
            clearButton = <button className="clear-completed" onClick={this.clearCompleted}>Clear completed</button>;
        }

        return(
            <footer className="footer">
                <span className="todo-count"><strong>{count}</strong> {itemWord} left</span>
                <ul className="filters">
                    <li>
                        <Link activeClassName="selected" to="all" >all</Link>
                    </li>
                    <li>
                        <Link activeClassName="selected" to="active" >active</Link>
                    </li>
                    <li>
                        <Link activeClassName="selected" to="completed" >completed</Link>
                    </li>
                </ul>
                {clearButton}
            </footer>
        );
    }
});

function watchCursors({ tasksleftCursor, todosCursor }) {
    return [tasksleftCursor, todosCursor];
}

function assignNewProps({ tasksleftCursor, todosCursor }) {
    return {
        tasksleft: tasksleftCursor.deref(),
        todos: todosCursor.deref()
    };
}

module.exports = orwell(Footer, watchCursors, assignNewProps);
