var express               = require('express');
var mongoose              = require("mongoose");
var passport              = require('passport');
var LocalStrategy         = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User                  = require('./models/user.js');
var bodyParser            = require("body-parser");
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync("./open_ssl/server.key", 'utf8');
var certificate = fs.readFileSync("./open_ssl/server.cert", 'utf8');

var credentials = {key: privateKey, cert: certificate};
var app = express();

var authController = require("./controllers/auth.js");
var homeController = require("./controllers/home.js");

//connect to db
//useNewUrlParser: true to prevent warnings or sth
mongoose.connect("mongodb://localhost/connectedin_db", { useNewUrlParser: true });

//uses
app.use(express.static(__dirname + '/assets/'));
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Router
var router = express.Router()

//express session
app.use(require('express-session')({
    secret            : "pol&kos",
    resave            : false,
    saveUninitialized : false
}));

app.set('view engine', 'ejs');

//passport stuff
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(authController);
app.use(homeController);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);

// app.listen(8090,function(){
//   console.log("Server Has Started");
// });
