var jwt = require("jsonwebtoken");
function tokenGenerator(secretOrPrivateKey, secretOrPublicKey, options){
	this.secretOrPrivateKey = secretOrPrivateKey;
	this.secretOrPublicKey = secretOrPublicKey;
	this.options = options // algorithm + keyid + noTimestamp + expiresIn + notBefore

}

tokenGenerator.prototype.sign = function(payload, signOptions){
	var jwtSignOptions = Object.assign({}, signOptions, this.options);
	return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
}

tokenGenerator.prototype.refresh = function(token, refreshOptions){
	var payload = jwt.verify(token, this.secretOrPublicKey, refreshOptions.verify);
	delete payload.iat;
	delete payload.exp;
	delete payload.nbf;
	delete payload.jti; //We are generating a new token, if you are using jwtid during signing, pass it in refreshOptions
	var jwtSignOptions = Object.assign({}, this.options, {jwtid: refreshOptions.jwtid});
	// The first signing converted all needed options into claims, they are already in the payload
	return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
}

module.exports = tokenGenerator;