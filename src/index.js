/**
 * index.js
 *
 */

// todomvc assets
require('todomvc-app-css/index.css');

const
Router = require('react-router'),

Probe = require('minitrue').Probe,
routes = require('./components/routes'),
store = require('./store');

function bootstrapRender(mountNode, rootCursor) {
    let Handler;

    // NOTE: As of react v0.13, contexts are an undocumented feature
    // NOTE: As of react v0.13, React.withContext() is deprecated.
    // See: https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html
    const WithContext = React.createClass({

        childContextTypes: {
            rootCursor: React.PropTypes.instanceOf(Probe).isRequired
        },

        getChildContext: function() {
            return {
                rootCursor: rootCursor
            };
        },

        render: function() {
            return(<Handler {...this.props} />);
        }
    });

    function render(_handler, routestate) {
        if (_handler) Handler = _handler;

        React.render(<WithContext rootCursor={rootCursor} routestate={routestate} />, mountNode);

    }

    return render;
}

Router.run(routes, bootstrapRender(document.getElementById('todoapp'), store));
