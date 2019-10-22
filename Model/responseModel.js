var mongoose = require("mongoose");
var account = require("./accountModel.js");


var Response = mongoose.Schema ({
	success: {type: Boolean, default: false},
	name: String,
	errorMessage: String,
	updatedAt: {type: String, default: undefined},
	Account: {type: mongoose.Schema.Types.ObjectId, ref: 'account'}
});
module.exports = mongoose.model("response", Response);