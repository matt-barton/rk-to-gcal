'use strict'

// Express Dependencies
var express = require('express')
var app = express()
var port = 3000

// Use Handlebars for templating
var exphbs = require('express3-handlebars')
var hbs

// For gzip compression
app.use(express.compress())

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

// Set Handlebars
app.set('view engine', 'handlebars')

// Routing
require('./routes')(app)


/*
*
*
* Testing Runkeeper stuff
*
*
*/

var rkOptions = {
// Client ID: 
    // This value is the OAuth 2.0 client ID for your application.  
    client_id : '01609b1a940b4affad7124a284f9eeb4',

    // Client Secret:  
    // This value is the OAuth 2.0 shared secret for your application.   
    client_secret : 'cd15680cd8b64b6aa885b5f24f8a79ea',

    // Authorization URL:   
    // This is the URL to which your application should redirect the user in order to authorize access to his or her RunKeeper account.   
    auth_url : "https://runkeeper.com/apps/authorize",

    // Access Token URL:    
    // This is the URL at which your application can convert an authorization code to an access token. 
    access_token_url : "https://runkeeper.com/apps/token",

    // Redirect URI:   
    // This is the URL that RK sends user to after successful auth  
    // URI naming based on Runkeeper convention 
    redirect_uri : "http://localhost:3000/rk"
}

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

/*
*
*
* End Runkeeper
*
*
*/

// Start it up
app.listen(process.env.PORT || port)
console.log('Express started on port ' + port)