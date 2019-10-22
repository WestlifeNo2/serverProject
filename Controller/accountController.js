var account = require("../Model/accountModel.js");
var bcrypt = require("bcrypt");
var response = require("../Model/responseModel.js");
var CODE =  require("../Helper/statusCode.js");
var jsonGenerator = require("../Helper/jsonGenerator.js");
var day = new Date();
var path = require("path");
//var multer = require("multer");
// Create and save account
exports.create = function(req,res){
  if (!req.body) {
    return res.status(401).json("account content can not be empty");
  }

  account.findOne({userName: req.body.userName}, function(err, newAccount){
    if (newAccount) {
      let responseClient = jsonGenerator.status.userExsited();
      return res.status(401).json(responseClient);
    }
    else if (err) {
      let responseClient = jsonGenerator.status.error();
      return res.status(400).json(responseClient);
    }
    else {
      account.findOne({email: req.body.email}, function(err, account){
    if (err){
      let responseClient = jsonGenerator.status.error();
      return res.status(400).json(responseClient);    
    }
    else {
      if (account){
        let responseClient = jsonGenerator.status.emailExsited();
        return res.status(401).json(responseClient);
      }
    }
  });
    }
    });

    //Hash password
    bcrypt.hash(req.body.password, 10, function (err, hash){
    if (err) {
      let responseClient = jsonGenerator.status.error();
      return res.status(400).json(responseClient);
    }
    // Create a new account with password hashed
  var newAccount = new account(req.body);
    newAccount.createdAt = day.getFullYear() + "-" + day.getMonth() + "-" + day.getDate() + " " + day.getHours() + ":" + day.getMinutes();
    newAccount.password = hash;
     // Save account into the database 
    newAccount.save().then(function (data){
      var responseClient = new response({
        success: true,
        name: "addUser",
        Account: data
      });
    return res.status(200).json(responseClient);
  })

  });

};

// Retrieve and return all accounts from database 
exports.findAll = function(req,res){

  account.find().then(function(account){
    return res.json(account);
  }).catch(function(err){
    if (err){
      let responseClient = jsonGenerator.status.error();
       return res.status(400).json(responseClient);
    }
  });

};

//Find a single account with a userName 
exports.findOne = function(req,res){
  account.findOne({userName: req.body.userName}, function(err, account){
    if (!account){
      let responseClient = jsonGenerator.status.userNotExsited();
      return res.json(responseClient);
    }
    else {
      if (err){
        let responseClient = jsonGenerator.status.error();
        return res.status(400).json(responseClient);
      }
      let responseClient = new response({
        success: true,
        name: "find one user",
        Account: account
      });
      return res.status(200).json(responseClient);
    }
  })
};

//Update account identified by the name in the request (Not update password)
exports.update = function(req,res){
  if (!req.body){
    return res.status(400).json("Content cannot be empty");
  }

  // Find accout and update it with the request body 
  account.findOneAndUpdate({userName: req.body.userName}, req.body, {new: true}, function(err, account){
    if (!account){
      let responseClient = jsonGenerator.status.userNotExsited();
      return res.status(401).json(responseClient);
    }
    else {
      if (err){
        let responseClient = jsonGenerator.status.error();
        return res.status(401).json(responseClient);
      }
      else {
        let responseClient = new response({
          success: true,
          name: "update",
          errorMessage: "null",
          updatedAt: day.getFullYear() + "-" + day.getMonth() + "-" + day.getDate() + " " + day.getHours() + ":" + day.getMinutes(),
          Account: account
        });
        return res.status(200).json(responseClient);
        
      }
    }
  });
};

// Delete account with the speicified userName in the request 
exports.delete = function(req,res){
  account.findOneAndDelete({userName: req.account.userName}, function(err, account){
    if (!account){
      let responseClient = jsonGenerator.status.userNotExsited();
      return res.status(401).json(responseClient);
    }
    else {
      if (err){
        let responseClient = jsonGenerator.status.error();
        return res.status(400).json(responseClient);
      }
      else {
        let responseClient = jsonGenerator.status.success();
        return res.status(200).json(responseClient);
      }
    }
  });
};

// Change password 
exports.changePassword = function(req,res){
  account.findOne({userName: req.account.userName}, function(err, account){
    if (err){
      let responseClient = jsonGenerator.status.error();
      return res.status(400).json(responseClient);
    }
    else {
      if (account){
         bcrypt.hash(req.body.newpassword, 10, function(err, hash){
          if (err){
            let responseClient = jsonGenerator.status.error();
            return res.status(400).json(responseClient);
          }
          else {
            account.password = hash; 
            account.save(function(err, data){
              if (err){
                let responseClient = jsonGenerator.status.updateError();
                return res.status(401).json(responseClient);
              }
              else {
                let responseClient = jsonGenerator.status.success(200, "Password Updated");

                return res.status(200).json(responseClient);
              }
            });

          }

        });
      }
      else {
        let responseClient = jsonGenerator.status.userNotExsited();
        return res.status(401).json(responseClient);
      }
    }
  });
};

exports.avatar = function (req, res){
  let originalname = req.file.originalname; 
  account.findOneAndUpdate({userName: req.account.userName}, 
                            {$set: { imageUrl: req.file.originalname}}, {new: true}, function(err, account){
                              if (err){
                                let responseClient = jsonGenerator.status.error();
                                return res.status(400).json(responseClient);
                              }
                              else {
                                let filename = req.file.originalname;
                                let message  = "http://loacalhost:3000/" +  path.resolve(__dirname, `../Uploads/${filename}`);
                                return res.status(200).json({success: true, message});
                              }
                            })
};

exports.getAvatar = function(req,res){
  let filename = req.params.name;
  if (!filename){
    let responseClient = jsonGenerator.status.error();
    return res.status(401).json(responseClient);
  }
  let message = path.resolve(__dirname, `../Uploads/${filename}`);
  return res.status(200).json({message});
}

exports.upgradeRole = function(req, res){
  let role = req.account.role;
  if (role === "Admin"){
    account.findOneAndUpdate({userName: req.body.userupgrade}, {$set: {role: 'Nhanvien'}}, {new: true}, function(err, account){
      if (err){
        let responseClient = jsonGenerator.status.error();
        return res.status(400).json(responseClient);
      }
      else {
        let responseClient = jsonGenerator.status.success(200, "Upgrade role succeeded");
        return res.status(200).json(responseClient);
      }
    });
  }
  else {
    let responseClient = jsonGenerator.status.failure(401, "You need to sign in with Admin account");
    return res.status(401).json(responseClient);
  }
}