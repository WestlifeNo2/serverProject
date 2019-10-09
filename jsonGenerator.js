var CODE = require("./statusCode.js");

class Status{
	get(success, typeError, codeNumber, message){
		return {success: success, typeError: typeError, codeNumber: codeNumber, message: message};
	}

	requireParameters(codeNumber, message){
		return this.get(false, CODE.PARAM_REQUIRE, codeNumber || 401, message || "Bad request");

	}

	unathorized(codeNumber, message){
		return this.get(false, CODE.UNAUTHORIZED, codeNumber || 400, message || "Unauthorized User");
	}

	updateError(codeNumber, message){
		return this.get(false, CODE.UPDATE_ERROR, codeNumber || 400, message || "Update error");

	}

	error(codeNumber, message){
		return this.get(false, CODE.ERROR, codeNumber || 400, message || "Error");
	}

	failure(codeNumber, message){
		return this.get(false, CODE.FAILURE, codeNumber || 400, message || "Failure");
	}

	success(codeNumber, message){
		return this.get(true, CODE.SUCCESS, codeNumber || 200, message || "Success");
	}

	wrongPasswordOrUsername(codeNumber, message){
		return this.get(false, CODE.WRONG_PASSWORD_OR_USERNAME, codeNumber || 401, message || "Wrong password or username");
	}

	userExsited(codeNumber, message){
		return this.get(false, CODE.USER_EXSITED, codeNumber || 401, message || "User exsited");
	}

}
exports.status = new Status();