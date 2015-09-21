'use strict'

// Express Dependencies
var http = require('http')
var express = require('express')
var app = express()
var port     = process.env.PORT || 3000;
var exphbs       = require('express-handlebars')
var morgan       = require('morgan');
var cookieParser = require('cookie-parser')
var bodyParser   = require('body-parser')
var session      = require('express-session')

/*
 * Config for Production and Development
 */
if (process.env.NODE_ENV === 'production') {
    // Set the default layout and locate layouts and partials
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir: 'dist/views/layouts/',
        partialsDir: 'dist/views/partials/'
    }))

    // Locate the views
    app.set('views', __dirname + '/dist/views')
    
    // Locate the assets
    app.use(express.static(__dirname + '/dist/assets'))

} else {
    app.engine('handlebars', exphbs({
        // Default Layout and locate layouts and partials
        defaultLayout: 'main',
        layoutsDir: 'views/layouts/',
        partialsDir: 'views/partials/'
    }))

    // Locate the views
    app.set('views', __dirname + '/views')
    
    // Locate the assets
    app.use(express.static(__dirname + '/assets'))
}

// set-up express
app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser())
app.set('view engine', 'handlebars')
app.use(session({ secret: 'supersecretsecretything' }))

// config
var rkOptions = require('./config/runkeeper.config.json')

// database
var cradle = require('cradle');
var dbHost, dbPort, dbOptions, dbDatabase;
dbOptions = {};
if (process.env.NODE_ENV === 'production') {
    dbHost = process.env.PROD_COUCH_HOST;
    dbPort = process.env.PROD_COUCH_PORT;
    dbDatabase = process.env.PROD_COUCH_DB;
    dbOptions.auth = {
        "username": process.env.PROD_COUCH_USERNAME,
        "password": process.env.PROD_COUCH_PASSWORD
    };
}
else {
    dbHost = process.env.DEV_COUCH_HOST;
    dbPort = process.env.DEV_COUCH_PORT;
    dbDatabase = process.env.DEV_COUCH_DB;
    if (process.env.DEV_COUCH_USERNAME != null) {
        obOptions.auth = {
            "username": process.env.DEV_COUCH_USERNAME,
            "password": process.env.DEV_COUCH_PASSWORD
        };
    }
}
var db = new(cradle.Connection)(dbHost, dbPort, dbOptions)
    .database(dbDatabase);

// libraries
app.lib = {}

var Runkeeper = require('./lib/runkeeper')
var Auth = require('./lib/auth')
var Couch  = require('./lib/couch')
var couchDb = new Couch(db)
var Mailer = require('./lib/mailer')

app.lib.db = couchDb
app.lib.utils = require('./lib/utils')
app.lib.emailer = new Mailer
app.lib.rk = new Runkeeper(rkOptions, app)
app.lib.auth = new Auth(app)

// routing
require('./lib/routes')(app)

//var code = 'eyJkYXRhIjp7InIiOiJodHRwOi8vbG9jYWxob3N0OjMwMDAvcmsiLCJjIjoiMDE2MDliMWE5NDBiNGFmZmFkNzEyNGEyODRmOWVlYjQiLCJ0IjoxNDQxMDk4NTM1NjY0LCJ1IjoxMDM5NjB9LCJtYWMiOiJNZXhMMit5ZDBYMGJYckRGNVJSOGFqV1FzWkxoTGFkeElFc3ZtNDNmWW44PSJ9'

/*
*
*
* Testing Runkeeper stuff
*
*
*/


/*
var runkeeper = require('runkeeper-js')
var rkClient = new runkeeper.HealthGraph(rkOptions)

// GET /rkconnect
app.get('/rkconnect', function (request, response, next) {
  
    var params = {
        client_id: rkOptions.client_id,
        response_type: 'code',
        redirect_uri: rkOptions.redirect_uri
    }

    var paramlist = []
    for (var param in params) {
        paramlist.push(param + '=' + params[param])
    }
    var url = rkOptions.auth_url + '?' + paramlist.join('&')
console.log(url)
    response.writeHead(301, {
        Location: url
    })
    response.end()  
})

// GET /rk
app.get('/rk', function (request, response, next) {
    var authCode = request.query.code;

    rkClient.getNewToken(authCode, function (err, access_token) {

        // If an error occurred during the Access Token request, handle it. For the example, we'll just output it and return false.
        if(err) { console.log(err); return false; }

        // Set the client's Access Token. Any future API Calls will be performed using the authorized user's access token. 
        rkClient.access_token = access_token;

        // Usually, you'll want to store the access_token for later use so that you can set it upon initialization of the Client
        console.log('access_token')
        console.log(access_token)
        
        // Example: Get user's Profile information
        rkClient.fitnessActivities(function(err, reply) {
            if(err) { console.log(err); }

            // Do whatever you need with the API's reply.
            console.log(reply);
        });
    })

    response.render('index')
})

/
*
*
* End Runkeeper
*
*
*/

// Start it up
app.listen(port)
console.log('Express started on port ' + port)