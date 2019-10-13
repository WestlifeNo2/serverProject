module.exports = function(app){
	var auth = require("authController.js");

	//Login 
	app.post('/login',auth.login);

	// Logout
	app.post('/logout',auth.logout);

	//Token
	app.post('/token',auth.token);
};