var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require ("mongoose");
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// Routing 
app.get("/", function (req, res){
	res.json("Welcome");
});

var url = "mongodb://localhost:27017/mydb";
mongoose.Promise = global.Promise;

// Connect MongoDB database 
mongoose.connect(url, {useNewUrlParser: true}).then(function(){
	console.log("Successfully connected to the database");
}).catch (function(err) {
	console.log("Could not connect to the database. Exiting now ", err)
	process.exit();
});
app.use(express.static("./Uploads"))
require("./Routes/accountRoutes.js")(app);
require("./Routes/authRoutes.js")(app);


// Listen request 


app.listen(3000, function (){
	console.log("Listening on port 3000");
});