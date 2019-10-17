module.exports = function(app){
	var account = require("../Controller/accountController.js");
	var auth = require("../Controller/authController.js");

	//create Account
	app.post("/createAccount", account.create);

	// find One 
	app.get("/findOne/:userName", account.findOne);

	//findAll
	app.get("/findAll", account.findAll);

	// update
	app.post("/update", auth.isAuthenticated, account.update);

	// delete 
	app.delete("/delete", account.delete);

	// change Password
	app.post("/changePassword", account.changePassword);
};