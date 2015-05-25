/**
 * components/app.js
 *
 */

const
Router = require('react-router'),
{
    RouteHandler
} = Router,

orwell = require('orwell'),
Probe = require('minitrue').Probe,

Main = require('./main'),
Header = require('./header'),
Footer = require('./footer');


const App = React.createClass({

    propTypes: {
        rootCursor: React.PropTypes.instanceOf(Probe).isRequired,
        routestate: React.PropTypes.object.isRequired
    },

    render: function () {
        const tasksleftCursor = this.props.rootCursor.cursor('tasksleft');
        const todosCursor = this.props.rootCursor.cursor('todos');

        return(
            <section className="todoapp">
                <Header />
                <Main
                    {...this.props}
                    tasksleftCursor={tasksleftCursor}
                    todosCursor={todosCursor}
                />
                <Footer
                    tasksleftCursor={tasksleftCursor}
                    todosCursor={todosCursor}
                    routestate={this.props.routestate}
                />
            </section>
        );
    }
});

module.exports = App;
