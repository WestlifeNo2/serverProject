var mongoose = require("mongoose");
var CODE = require("./statusCode.js");
var jsonGenerator = require("./jsonGenerator.js");
var jwt = require("jsonwebtoken");
var account = require("./accountModel.js");
var response = require("./responseModel.js");
var Config = require("./Config.js");

//Login 
exports.login = function (req,res){

	let userName = req.body.userName;
	let password = req.body.password;

	//validate
	if (!userName || !password){
		// response 
		let responseClient = jsonGenerator.status.requireParameters();
		return res.json(responseClient);
	}

	account.findOne({userName: req.body.userName}, function(err, account){
		if (!account){
			let responseClient = jsonGenerator.status.userExsited();
			return res.json(responseClient);
		}
		else {
			if (account && account.comparePassword(password)){
				let now = new Date();
				let currentTime = now.getTime();

				let payloadAccess = {userName: account.userName, createdTime: currentTime};
				let payloadRefresh = {usernName: account.userName, createdTime: currentTime};

				let jwtAccessToken = jwt.sign(payloadAccess, Config.jwtSecret);
				let jwtRefreshToken = jwt.sign(payloadRefresh, Config.jwtSecret);

				// Set to account 
				account.token = jwtAccessToken;
				account.refreshToken = jwtRefreshToken;
				account.createdTimeToken = currentTime;

				// Save
				account.save(function(err, newAccount){
					if (err){
						let responseClient = jsonGenerator.status.error();
						return res.json(responseClient);
					}

					// data 
					let data = {access_token: jwtAccessToken, refresh_token: jwtRefreshToken, token_type: "Bearer"};

					let responseAccount = new response({
						success: true,
						name: "Login successfully",
						userName: req.body.userName,
						Account: account
					});
					res.status(200).json(responseAccount);
				});
		}
	}
});
};

