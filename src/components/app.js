/**
 * components/app.js
 *
 */

const
Router = require('react-router'),
{
    RouteHandler
} = Router,

orwell = require('lib/orwell'),
Structure = require('lib/immstruct').Structure,

Main = require('./main'),
Header = require('./header'),
Footer = require('./footer');


const App = React.createClass({

    propTypes: {
        rootCursor: React.PropTypes.instanceOf(Structure).isRequired,
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

module.exports = orwell(App);
