/**
 * orwell is a higher-order component that can listen to cursors for changes,
 * and update the component whenever any cursor emit a change.
 *
 * orwell(Component, watchCursors, assignNewProps)
 *
 * A component may receive Probe cursors as props, and it's sometimes useful to intercept
 * those cursors and subscribe to them such that whenever they change, the component would
 * re-render.
 *
 * orwell takes the following parameters:
 * - Component: the component that depend on cursors which usually are recevied as props
 *              or somewhere else
 *
 * - watchCursors: a function that receives two parameters: props and manual
 *                 watchCursors may return an array of Probe cursors indicating
 *                 that the Component depends on them.
 *                 watchCursors may return a single Probe cursor, which is sugar
 *                 to an array containing that cursor.
 *                 Any other return value is ignored.
 *                 manual is a function that takes a function, say subscriber, with input update.
 *                 In the body of subscriber, the user can manually subscribe to a Probe cursor,
 *                 and call update to induce a re-render of the Component. This allows the user
 *                 to call update conditionally (e.g. validation step).
 *
 * - assignNewProps: a function to generate props that will be merged to props that orwell
 *                   receives.
 *                   this function will be called whenever:
 *                   1. subscribed Probe cursor has changed, or
 *                   2. orwell wrapped Component will receive new props
 *
 */

const React = require('react');
const isFunction = require('lodash.isfunction');
const isArray = require('lodash.isarray');
const isPlainObject = require('lodash.isplainobject');
const assign = require('lodash.assign');
const isEqual = require('lodash.isequal');
const Probe = require('probe');

const CACHED = {};
const DO_NOTHING = _ => void 0;
const DEFAULT_ASSIGN = _ => {};

module.exports = orwell;

function orwell(Component, watchCursors = DO_NOTHING, __assignNewProps = DEFAULT_ASSIGN) {

    // Check for optional static methods.
    if (isFunction(Component.watchCursors)) {
        watchCursors = Component.watchCursors;
    }
    if (isFunction(Component.assignNewProps)) {
        __assignNewProps = Component.assignNewProps;
    }

    let __shouldComponentUpdate = __shouldComponentUpdateShallow;

    const OrwellContainer = React.createClass({

        assignNewProps() {
            const ret = __assignNewProps.call(null, this.props);
            return isPlainObject(ret) ? ret : {};
        },

        // this function is subscribed to all given cursors, and is called whenever
        // any of those cursors change in some way.
        handleCursorChanged() {
            this.setState({
                currentProps: assign({}, this.props, this.assignNewProps())
            });
        },

        /* React API */

        displayName: `${Component.displayName}.OrwellContainer`,

        statics: {
            shouldComponentUpdate: function(scu) {
                __shouldComponentUpdate = scu == 'shallow' ? __shouldComponentUpdateShallow :
                                          scu == 'deep' ? __shouldComponentUpdateDeep :
                                          scu;
                return OrwellContainer;
            },
            shallow: function() {
                __shouldComponentUpdate = __shouldComponentUpdateShallow;
                return OrwellContainer;
            },
            deep: function() {
                __shouldComponentUpdate = __shouldComponentUpdateDeep;
                return OrwellContainer;
            }
        },

        getInitialState() {
            return {
                // array of functions to be called when OrwellContainer unmounts.
                // these functions, when called, handle the clean up step in removing
                // listeners from Probe cursors.
                unsubs: [],
                currentProps: assign({}, this.props, this.assignNewProps())
            };
        },

        shouldComponentUpdate(nextProps, nextState) {
            return(__shouldComponentUpdate.call(this, nextProps, nextState));
        },

        componentWillReceiveProps(nextProps) {
            if (!shallowEqual(this.props, nextProps, cursorCompare)) {
                this.setState({
                    currentProps: assign({}, this.props, this.assignNewProps())
                });
            }
        },

        componentWillMount() {
            let unsubs = [];

            /**
             * usage:
             *
             * manual(function(update) {
             *
             *   const unsubscribe = cursor.on(event, function() {
             *     // ...
             *     update();
             *   });
             *   return unsubscribe;
             * });
             *
             * user call manual function with a function that take in an update function.
             * The provided function will allow a custom validation step whenever some
             * cursor has changed. If this validation passes, user would call the update
             * function to induce a re-render.
             */
            const manual = (fn) => {
                const cleanup = fn.call(null, this.handleCursorChanged);
                if(cleanup && isFunction(cleanup)) {
                    unsubs.push(cleanup);
                }
            }

            // watchCursors may return either a single cursor or an array of cursors.
            // These cursors are designated to be observed, and when an event change
            // has occured at these cursors, this component shall update.
            let cursorsToWatch = watchCursors.call(null, this.props, manual);

            // watchCursors may return a single cursor
            if(cursorsToWatch instanceof Probe) {
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

            // NOTE: `render()` will see the updated state and will be executed
            // only once despite the state change.
            this.setState({
                unsubs: unsubs
            });
        },

        componentWillUnmount() {
            for(const unsub of this.state.unsubs) {
                unsub.call(null);
            }
        },

        render() {
            return(<Component {...this.state.currentProps} />);
        }
    });

    return OrwellContainer;
}

/* helpers */

function cursorCompare(valueA, valueB) {
    if(!(valueA instanceof Probe) || !(valueB instanceof Probe)) {
        return void 0;
    }

    if(!isEqual(valueA.keyPath(), valueB.keyPath())) {
        return false;
    }

    return(valueA.firstValue() === valueB.deref());
}

function __shouldComponentUpdateShallow(nextProps, nextState) {
    return(!shallowEqual(this.state.currentProps, nextState.currentProps, cursorCompare));
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
    const key = keysA[i];
    const valueA = objA[key];
    const valueB = objB[key];

    const ret = compare ? compare(valueA, valueB) : void 0;
    if(ret === false || ret === void 0 && valueA !== valueB) {
        return false;
    }
  }

  return true;
}
