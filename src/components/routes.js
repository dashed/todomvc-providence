/**
 * components/routes.js
 *
 * top-level routes
 */

const
Router = require('react-router'),
{
    Route,
    DefaultRoute
} = Router,

/* components */
App = require('components/app'),
All = require('components/all'),
Active = require('components/active'),
Completed = require('components/completed');

module.exports = (
    <Route name='app' path='/' handler={App} >
        <DefaultRoute name="all" handler={All}/>
        <Route name="active" handler={Active}/>
        <Route name="completed" handler={Completed}/>
    </Route>
);
