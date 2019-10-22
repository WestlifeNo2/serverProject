module.exports = function(app){
	var account = require("../Controller/accountController.js");
	var auth = require("../Controller/authController.js");
	var multer = require("multer");
	var UPLOAD_CONFIG = require("../Helper/multerConfig.js");

	//create Account
	app.post("/user/signup", account.create);

	// find One 
	app.get("/user/profile", account.findOne);

	//findAll
	app.get("/findAll", account.findAll);

	// update
	app.post("/user/updateuser", auth.isAuthenticated, account.update);

	// delete 
	app.delete("/delete", auth.isAuthenticated, account.delete);

	// change Password
	app.post("/user/changepassword", auth.isAuthenticated, account.changePassword);

	// Upload avatar 
	app.post("/uploadavatar", auth.isAuthenticated, UPLOAD_CONFIG.single('image'), account.avatar);

	// Get avatar 
	app.get("/user/getavatar", auth.isAuthenticated, account.getAvatar);

	//Upgrade role 
	app.post("/user/upgraderole", auth.isAuthenticated, account.upgradeRole);
};