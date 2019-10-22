var mongoose = require("mongoose");
var CODE = require("../Helper/statusCode.js");
var jsonGenerator = require("../Helper/jsonGenerator.js");
var jwt = require("jsonwebtoken");
var account = require("../Model/accountModel.js");
var response = require("../Model/responseModel.js");
var Config = require("../Helper/Config.js");
var CONSTANT = require("../Helper/constant.js");
var passport = require("passport");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var async = require("async");
var bcrypt = require("bcrypt");

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
			let responseClient = jsonGenerator.status.userNotExsited();
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
						errorMessage: "null",
						userName: req.body.userName,
						Account: newAccount
					});
					res.status(200).json(responseAccount);
				});
		}
	}
});
};

// Logout 
exports.logout = function(req, res){
	if (req.account){
		req.account.refreshToken = undefined; 
		req.account.createdTimeToken = undefined;
		req.account.token = undefined;
		req.account.save(function(err, newAccount){
			if (err){
				let responseClient = jsonGenerator.status.updateError();
				return res.json(responseClient);
			}

			let responseClient = jsonGenerator.status.success(200, "Sign out succeeded");
			return res.status(200).json(responseAccount);
		});
	}
	else {
			let responseClient = jsonGenerator.status.error();
			return res.status(400).json(responseClient);
		}
};

//isAuthenticated to check token 
exports.isAuthenticated = function(req, res, next){
	if (req.headers && req.headers.authorization){
		let jwtToken = req.headers.authorization;
		jwt.verify(jwtToken, Config.jwtSecret, function(err, payload){
			if (err){
				let responseClient = jsonGenerator.status.unauthorized();
				return res.json(responseClient);
			}
			else {
				let now = new Date();
				let currentTime = now.getTime();
				let createdTime = payload.createdTime;
				let differTime = (currentTime -createdTime) / 1000;
				if (differTime > CONSTANT.ACCESS_TIMEOUT){
					let responseClient = jsonGenerator.status.unauthorized();
					return res.json(responseClient);
				}

				// get user
				//let username = payload.userName;

				account.findOne({token: req.headers.authorization}, function(err, account){
					if (account){
						req.account = account;
						next();
					}
					else {
						let responseClient = jsonGenerator.status.unauthorized();
						 return res.json(responseClient);
					}
				});


			}
		});
	}
	else {
		let responseclient = jsonGenerator.status.unauthorized();
		res.json(responseClient);
	}
};


// Forgot password 
exports.forgot = function(req, res, next){
	async.waterfall([
		function(done){
			crypto.randomBytes(6, function(err, buff){
				var token = buff.toString('hex');
				done(err, token);
			});
		},
		function(token, done){
			account.findOne({email: req.body.email}, function(err, account){
				if (!account){
					let responseClient = jsonGenerator.status.emailNotExsited();
					return res.json(responseClient);
				}
				account.resetPasswordPIN = token;
				account.resetPasswordExpire = Date.now() + 3600000;
				account.save(function(err){
					done(err, token, account);
				});

			});
		}, 
		function(token, account, done){
			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: "partyuitk11@gmail.com",
					pass: "partyuit123"
				}
			});
			
			var mailOptions = {
				to: account.email,
				from: "partyuitk11@gmail.com",
				subject: "Party Booking Password Reset",
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please enter the code, or paste this into your reset password form to complete the process:\n\n' 
           + token + '\n\n' + 
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err){
				console.log("Email Sent");
				let responseClient = new response({
					success: true,
					name: "Get account token reset password",
					Account: account
				});
				return res.json(responseClient);
			});
		}
		], function(err){
			if (err){
				let responseClient = jsonGenerator.status.error();
				return res.json(responseClient);
			}
		});
};

// Get reset password token 
exports.reset = function(req, res,){
	account.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()} }, function(err, account){
		if (!account){
			let reponseClient = jsonGenerator.status.userNotExsited();
			return res.json(responseClient);
		}
		else{
			let responseClient = new response({
				success: true,
				name: "Get account token reset password",
				errorMessage: "null",
				Account: account
			});
			return res.json(responseClient);
		}
	});
};

exports.resetConfirm = function(req, res){
	async.waterfall([
		function(done){
			account.findOne({resetPasswordPIN: req.body.resetPasswordPin, resetPasswordExpire: {$gt: Date.now()} }, function(err, account){
				if(!account){
					let responseClient = jsonGenerator.status.userNotExsited();
					return res.json(responseClient);
				}
				if (req.body.password){
					bcrypt.hash(req.body.password, 10, function(err, hash){
						if (err){
							let responseClient = jsonGenerator.status.error();
							return res.json(responseClient);

						}
						else {
							account.password = hash;
							account.resetPasswordPIN = undefined;
							account.resetPasswordExpire = undefined;
							account.save(function(err, account){
								if (err){
									let responseClient = jsonGenerator.status.error();
									return res.json(responseClient);
								}
								else {
									let responseClient = new response({
										success: true,
										name: "Change password",
										Account: account
									});
									return res.json(responseClient);
								}
							});

						}
					});
				}
				else {
					let responseClient = jsonGenerator.status.passwordNotMatch();
					return res.json(responseClient);
				}
			});
		},
		function(account, done){
			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				auth:{
					user: "tanhaon7@gmail.com",
					pass: "Hao123456"
				}
			});
			var mailOptions = {
				to: account.email,
				from: "tanhaon7@gmail.com",
				subject: "Your password has been changed",
				text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + account.email + ' has just been changed.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err){
				if (err){
				let responseClient = jsonGenerator.status.error();
				return res.json(responseClient);
			}
			});
		}], function(err){
			if (err){
				let responseClient = jsonGenerator.status.error();
				return res.json(responseClient);
			}
			
		});
};
