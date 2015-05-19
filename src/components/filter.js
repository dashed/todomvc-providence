/**
 * components/filter.js
 *
 */

const orwell = require('lib/orwell');
const Structure = require('lib/immstruct').Structure;

const List = require('./list');

const DEFAULTWATCH = function({ rootCursor }) {
    return rootCursor.cursor('todos');
}


module.exports = function(filterRecord, watchCursors = DEFAULTWATCH) {
    const Filtered = React.createClass({

        propTypes: {
            rootCursor: React.PropTypes.instanceOf(Structure).isRequired,
            todosCursor: React.PropTypes.instanceOf(Structure).isRequired,
            tasksleftCursor: React.PropTypes.instanceOf(Structure).isRequired
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
