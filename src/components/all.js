/**
 * components/all.js
 *
 */

const FilterList = require('./filter');

module.exports = FilterList(_ => false, watchCursors);

function watchCursors({ todosCursor }, manual) {

    manual(function(update) {

        const todos = todosCursor;
        let prevSize = todos.deref().size;

        return todos.observe(function() {

            // only re-render if the todos list has changed in size

            let newSize = todos.deref().size;
            if(newSize != prevSize) {
                prevSize = newSize;
                return update();
            }
        });
    });
}

