module.exports = function(app){
	var auth = require("../Controller/authController.js");

	//Login 
	app.post("/user/signin", auth.login);

	// Logout
	app.post("/user/signout", auth.isAuthenticated, auth.logout);

	//Forgot password 
	app.post("/user/resetpassword", auth.forgot);

	app.get("/getreset", auth.reset);

	app.post("/user/resetconfirm", auth.resetConfirm);


};