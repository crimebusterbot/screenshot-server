// BASE SETUP

// call the packages we need
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

let port = process.env.PORT || 3456;

const routes = require('./app/routes/routes');

// configure bodyParser
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Disable standard Express header for security purposes
app.disable('x-powered-by');

// Make the routes
app.use('/', routes);

const server = app.listen(port, function() {
    console.log( 'Server listening on port ' + server.address().port );
});

module.exports = app;