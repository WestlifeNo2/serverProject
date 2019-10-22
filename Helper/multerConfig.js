var multer = require("multer");
var path = require("path");
var PATH_STORAGE_IMAGE = path.resolve(__dirname, "../Uploads");
var storage = multer.diskStorage({
	destination: function( req, file, cb){
		cb(null, PATH_STORAGE_IMAGE)
	},
	filename: function(req, file, cb){
		cb(null, file.originalname);
	}
});

var fileFilter = function(req, file, cb){
	var {mimetype} = file;
	if (mimetype === "image/jpeg" || mimetype === "imgage/png"){
		cb(null, true);
	}
	cb(new Error("input_not_valid"));
}

var upload = multer({storage});

module.exports = upload;