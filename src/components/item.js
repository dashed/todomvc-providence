/**
 * components/item.js
 *
 */

const classNames = require('classnames');

const orwell = require('lib/orwell');
const Probe = require('minitrue').Probe;

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

const Item = React.createClass({

    getInitialState() {
        return {
            editing: false,
            editText: ''
        };
    },

    propTypes: {
        recordCursor: React.PropTypes.instanceOf(Probe).isRequired,
        record: React.PropTypes.instanceOf(Immutable.Record).isRequired
    },

    componentDidUpdate(_, prevState) {
        if (!prevState.editing && this.state.editing) {
            const node = this.refs.editField.getDOMNode();
            node.focus();
            node.setSelectionRange(node.value.length, node.value.length);
        }
    },

    /* component API */

    handleCheckbox(event) {
        event.stopPropagation();

        const completed = this.props.record.get('completed');
        const newCompletedVal = !completed;

        this.props.recordCursor.update(function(record) {
            return record.set('completed', newCompletedVal);
        });

    },

    handleDestroy() {
        this.props.recordCursor.delete();
    },

    handleEdit(event) {
        this.props.editingCursor.update((cleanup) => {
            if(cleanup) {
                // call the cleanup step of some record, so that it will exit
                // edit mode
                cleanup();
            }

            // set this record's cleanup step
            return () => {
                this.setState({
                    editing: false
                });
            };
        });
        this.setState({
            editing: true,
            editText: this.props.record.get('task')
        });
    },

    handleSubmit() {
        if(!this.state.editing) {
            return;
        }

        const newTask = this.state.editText.trim();
        if(newTask.length <= 0) {
            this.props.editingCursor.update((cleanup) => {
                cleanup();
                return null;
            });
            return this.handleDestroy();
        }

        this.props.recordCursor.update(function(record) {
            return record.set('task', newTask);
        });

        this.props.editingCursor.update((cleanup) => {
            cleanup();
            return null;
        });
    },

    handleChange(event) {
        this.setState({editText: event.target.value});
    },

    handleKeyDown(event) {
        if(!this.state.editing) {
            return;
        }

        if (event.which === ESCAPE_KEY) {
            // cancel edit
            this.props.editingCursor.update((cleanup) => {
                cleanup();
                return null;
            });
        } else if (event.which === ENTER_KEY) {
            // save edit
            const node = this.refs.editField.getDOMNode();
            node.blur();
        }
    },

    render: function () {
        const record = this.props.record;
        const completed = record.get('completed');
        const task = record.get('task');
        console.log('item render');
        return(
            <li className={classNames({
                completed: completed,
                editing: this.state.editing
            })}>
                <div className="view">
                    <input className="toggle" type="checkbox" onChange={this.handleCheckbox} checked={completed} />
                    <label onDoubleClick={this.handleEdit}>{task}</label>
                    <button className="destroy" onClick={this.handleDestroy} ></button>
                </div>
                <input
                    ref="editField"
                    className="edit"
                    value={this.state.editText}
                    onBlur={this.handleSubmit}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                />
            </li>
        );
    }

});

function watchCursors({recordCursor }) {
    return [recordCursor];
}

function getPropsFromCursors({ recordCursor }) {
    return {
        record: recordCursor.deref()
    };
}

module.exports = orwell(Item, watchCursors, getPropsFromCursors);
