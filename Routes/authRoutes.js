module.exports = function(app){
	var auth = require("../Controller/authController.js");

	//Login 
	app.post("/login", auth.login);

	// Logout
	app.post("/logout", auth.isAuthenticated, auth.logout);

	//Token
	//app.post("/token", auth().token);

	//Forgot password 
	app.post("/forgot", auth.forgot);
	app.get("/getreset", auth.reset);
	app.post("/reset", auth.resetToken);

};