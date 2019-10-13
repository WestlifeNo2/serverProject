module.exports = function(app){
	var account = require("./accountController.js");

	//create Account
	app.post("/createAccount", account.create);

	// find One 
	app.get("/findOne/:userName", account.findOne);

	//findAll
	app.get("/findAll", account.findAll);

	// update
	app.put("/update", account.update);

	// delete 
	app.delete("/delete", account.delete);

	// change Password
	app.put("/changePassword", account.changePassword);
};