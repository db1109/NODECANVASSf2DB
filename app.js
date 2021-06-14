const express = require("express");
var jsforce = require('jsforce');
var qpdf = require('node-qpdf');
const app = express()
let ejs = require('ejs');
var pdf = require("pdf-creator-node");
var fs = require("fs");
const bodyParser = require("body-parser");
var crypto = require("crypto");
var consumerSecretApp = process.env.CANVAS_CONSUMER_SECRET || '5A6EEC031EBD4C7F778BBF60FDCB973881E71C698F2F90B576E6E9FE2A7BEC12';
var oauthtoken = '';
var username = '';
var userId ='';
var sfdcdata;
var jsforcedata;
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.static("public"))
app.set('view engine', 'ejs');
app.get("/", function (req, res) {})
//CHECK THAT THE REQUEST IS OK FROM CANVASS APP
app.post('/', function (req, res) { 
  var bodyArray = req.body.signed_request.split(".");
    var consumerSecret = bodyArray[0];
    var encoded_envelope = bodyArray[1];
    var check = crypto.createHmac("sha256", consumerSecretApp).update(encoded_envelope).digest("base64");
    if (check === consumerSecret) { 
        var envelope = JSON.parse(new Buffer(encoded_envelope, "base64").toString("ascii"));
        oauthtoken =envelope.client.oauthToken;
        username = envelope.context.user.userName;
        userId = envelope.userId;
        sfdcdata = envelope.context.environment.parameters;
       var conn = new jsforce.Connection({
          serverUrl : 'https://klmdemoorgoct2019-dev-ed.my.salesforce.com',
          sessionId : oauthtoken  });
          conn.query("SELECT Id, Name FROM Account limit 50", function(err, result) {
                     if (err) { return console.error(err); }
                    jsforcedata = result;
                    var pagevariables ={canvasrecords: sfdcdata, jsforcerecords: jsforcedata};
                    res.render("canvassaccess.ejs", {pv: pagevariables});
                    console.log('');
                   });
                  }
else{res.sendFile(__dirname + "/public/index.html");} 
})
//STARTING SERVER
app.listen(process.env.PORT || 3000, 
  () => console.log("Server is running..."));


