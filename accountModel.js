var mongoose = require("mongoose");
var validator = require("validator");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var createAccount = mongoose.Schema({
	fullName: String,
	userName: {type: String,
				unique: true,
				required : true },
	email: { type: String,
			required: true,
			unique: true},
	phoneNumber: String,
	password: { type: String, required: true},
	newpassword: String,
	role: {type: String, default: "Khach Hang"},
	created_date: String,
	update_date: String,
	token: String,
	createdTimeToken: String,
	refreshToken: String
});

createAccount.methods.comparePassword = function(passwordCompare){
	return bcrypt.compare(passwordCompare, this.password);
};

module.exports = mongoose.model( "account", createAccount);
// module.exports = mongoose.model(" login", login);
// module.exports = mongoose.model("response", response);