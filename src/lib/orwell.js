/**
 * lib/orwell.js
 *
 * Higher-order component to observe given cursors, and will re-render when those cursors
 * change in some way.
 *
 * This is an alternative approach to top-down rendering.
 *
 * The given Component may have two optional static methods which will override
 * the functions given to orwell:
 * - watchCursors(props, manual): May return an array of cursors that can be generally observed,
 *                                and will update Component when those cursors change in any way.
 *                                May instead return a cursor, which is a shorthand for an array of
 *                                a single cursor.
 *                                A second parameter, manual, is given to do any manual observation
 *                                allowing any necessary validation/filter step.
 * - getStateFromCursors(props):  Should return 'reduced' state which will be merged to props
 *                                that will be fed into Component. Ideally this should be
 *                                constructed using cursors.
 *
 * Inspiration:
 * https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750
 * https://github.com/goatslacker/alt/blob/master/src/utils/connectToStores.js
 */

const _ = require('lodash');
const React = require('react');
const Immutable = require('immutable');
const { isFunction, isArray } = _;

const Prolefeed = require('prolefeed');

module.exports = orwell;

const base = Immutable.fromJS({});

const DO_NOTHING = _ => void 0;
const DEFAULT_STATE = _ => {};

function orwell(Component, watchCursors = DO_NOTHING, __getStateFromCursors = DEFAULT_STATE) {

    // Check for optional static methods.
    if (isFunction(Component.watchCursors)) {
        watchCursors = Component.watchCursors;
    }
    if (isFunction(Component.getPropsFromStores)) {
        __getStateFromCursors = Component.getStateFromCursors;
    }

    let __shouldComponentUpdate = __shouldComponentUpdateShallow;
    let __onChange = DO_NOTHING;

    const CursorConnection = React.createClass({

        'statics': {
            shouldComponentUpdate: function(checktype) {
                __shouldComponentUpdate = checktype == 'shallow' ? __shouldComponentUpdateShallow :
                                          checktype == 'deep' ? __shouldComponentUpdateDeep :
                                          checktype;
                return CursorConnection;
            },
            shallow: function() {
                __shouldComponentUpdate = __shouldComponentUpdateShallow;
                return CursorConnection;
            },
            deep: function() {
                __shouldComponentUpdate = __shouldComponentUpdateDeep;
                return CursorConnection;
            },
            onChange: function(fn) {
                __onChange = fn;
                return CursorConnection;
            }
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            return __shouldComponentUpdate.call(this, nextProps, nextState);
        },

        getStateFromCursors(props, prevProps) {
            return __getStateFromCursors.call(null, props, prevProps);
        },

        handleCursorChanged() {
            const newState = this.getStateFromCursors(this.props, this.state.data);
            // TODO: ensure newState is plain object
            this.setState({
                data: _.assign({}, this.state.data, newState)
            });
            __onChange.call(this, this.props);
        },

        /* React API */

        getInitialState() {
            const newState = this.getStateFromCursors(this.props, {});
            // TODO: ensure newState is plain object
            return {
                meta: base,
                data: _.assign({}, newState)
            };
        },

        componentWillMount() {
            let unsubs = [];

            const manual = (fn) => {
                const cleanup = fn.call(null, this.handleCursorChanged);
                if(cleanup && isFunction(cleanup)) {
                    unsubs.push(cleanup);
                }
            }

            let cursorsToWatch = watchCursors(this.props, manual);

            if(cursorsToWatch instanceof Prolefeed) {
                cursorsToWatch = [cursorsToWatch];
            }

            if(isArray(cursorsToWatch)) {
                for(const cursor of cursorsToWatch) {
                    const unsub = cursor.observe(_ => {
                        this.handleCursorChanged();
                    });
                    unsubs.push(unsub);
                }
            }

            this.setState({
                meta: this.state.meta.set('unsubs', unsubs)
            });
        },

        componentWillUnmount() {
            for(const unsub of this.state.meta.get('unsubs')) {
                unsub();
            }
        },

        componentWillReceiveProps(nextProps) {
            if (!shallowEqual(nextProps, this.props)) {
                const newState = this.getStateFromCursors(this.props, this.state.data);
                // TODO: ensure newState is plain object
                this.setState({
                    data: _.assign({}, this.state.data, newState)
                });
            }
        },

        render() {
            return(<Component {...this.props} {...this.state.data} />);
        }
    });

    return CursorConnection;
}

/* helpers */

function cursorCompare(valueA, valueB) {
    if(!(valueA instanceof Prolefeed) || !(valueB instanceof Prolefeed)) {
        return false;
    }
    return(valueA.deref() === valueB.deref());
}

function __shouldComponentUpdateShallow(nextProps, nextState) {
    if(!shallowEqual(this.state, nextState, cursorCompare)) {
        return true;
    }
    return(!shallowEqual(this.props, nextProps, cursorCompare));
}

function __shouldComponentUpdateDeep(nextProps, nextState) {
    // TODO: implement
}

// TODO: refactor this to somewhere else; maybe ./utils
// copied from: https://raw.githubusercontent.com/gaearon/react-pure-render/master/src/shallowEqual.js
function shallowEqual(objA, objB, compare) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (let i = 0; i < keysA.length; i++) {
    if (!bHasOwnProperty(keysA[i])) {
      return false;
    }
    const valueA = objA[keysA[i]];
    const valueB = objA[keysB[i]];
    if(compare && !compare(valueA, valueB)) {
        return false;
    }
    if(!compare && valueA !== valueB) {
        return false;
    }
  }

  return true;
}
