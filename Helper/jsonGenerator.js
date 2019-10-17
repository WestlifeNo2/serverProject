var CODE = require("./statusCode.js");

class Status{
	get(success, typeError, codeNumber, message){
		return {success: success, typeError: typeError, codeNumber: codeNumber, message: message};
	}

	requireParameters(codeNumber, message){
		return this.get(false, CODE.PARAM_REQUIRE, codeNumber || 401, message || "Bad request");

	}

	unauthorized(codeNumber, message){
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

	userNotExsited(codeNumer, message){
		return this.get(false, CODE.USER_NOT_EXSITED, codeNumber || 401, message || "User not exsited");
	}

	emailExsited(codeNumber, message){
		return this.get(false, CODE.EMAIL_EXSITED, codeNumber || 401, message || "Email exsited");
	}
	emailNotExsited(codeNumber, message){
		return this.get(false, CODE.EMAIL_NOT_EXSITED, codeNumber || 401, message || "Email not exsited");
	}
	passwordNotMatch(codeNumber, message){
		return this.get(false, CODE.PASSWORD_NOT_MATCH, codeNumber || 401, message || "Password not match");

	}

}
exports.status = new Status();