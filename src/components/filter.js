/**
 * components/filter.js
 *
 */

const orwell = require('lib/orwell');
const Probe = require('minitrue').Probe;

const List = require('./list');

const DEFAULTWATCH = function({ rootCursor }) {
    return rootCursor.cursor('todos');
}


module.exports = function(filterRecord, watchCursors = DEFAULTWATCH) {
    const Filtered = React.createClass({

        propTypes: {
            rootCursor: React.PropTypes.instanceOf(Probe).isRequired,
            todosCursor: React.PropTypes.instanceOf(Probe).isRequired,
        },

        render: function () {
            const rootCursor = this.props.rootCursor;

            return(
                <List
                    {...this.props}
                    editingCursor={rootCursor.cursor('editing')}
                    filterTodo={filterRecord}
                />
            );
        }
    });
    return orwell(Filtered, watchCursors);
}
