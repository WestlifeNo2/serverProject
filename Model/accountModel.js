var mongoose = require("mongoose");
var validator = require("validator");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var day = new Date();
var createAccount = mongoose.Schema({
	fullName: String,
	userName: { type: String,
				unique: true,
				required : true },
	email: { type: String,
			required: true,
			unique: true},
	phoneNumber: String,
	password: { type: String, required: true},
	role: {type: String, default: "Khach Hang"},
	token: String,
	createdTimeToken: String,
	refreshToken: String,
	resetPasswordPIN: String,
	resetPasswordExpire: String,
	imageUrl: String,
	createdAt: {type : String, default: undefined}
});

createAccount.methods.comparePassword = function(passwordCompare){
	return bcrypt.compare(passwordCompare, this.password);
};

module.exports = mongoose.model( "account", createAccount);
// module.exports = mongoose.model(" login", login);
// module.exports = mongoose.model("response", response);