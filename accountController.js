var account = require("./accountModel.js");
var bcrypt = require("bcrypt");
var response = require("./responseModel.js");
var CODE =  require("./statusCode.js");
var jsonGenerator = require("./jsonGenerator.js");
// Create and save account
exports.create = function(req,res){
  if (!req.body) {
    return res.status(401).json("account content can not be empty");
  }
  account.findOne({userName: req.body.userName}, function(err, newAccount){
    if (newAccount != null) {
      var newAccount = new account(req.body);
      var responseAccount = new response({
        name : "addUser",
        errorMessage : "User existed",
        username : req.body.userName,
        Account : newAccount});
      return res.status(401).json(responseAccount);
    }
    //Hash password
    bcrypt.hash(req.body.password, 10, function (err, hash){
    if (err) {
      res.json("error");
    }
    // Create a new account with password hashed
  var newAccount = new account(req.body);

    newAccount.password = hash;
     // Save account into the database 
    newAccount.save().then(function (data){
      var responseAccount = new response({
        success: true,
        name: "addUser",
        errorMessage: "null",
        username: req.body.userName,
        Account: newAccount
      });
    res.status(200).json(responseAccount);
  }).catch (function (err){
    if(err){
    res.status(400).json("Some errors occured");
  }
});

  });
    });

  
};

// Retrieve and return all accounts from database 
exports.findAll = function(req,res){

  account.find().then(function(account){
    res.json(account);
  }).catch(function(err){
    if (err){
      res.json("Some errors occured");
    }
  });

};

//Find a single account with a userName 
exports.findOne = function(req,res){
  account.findOne({userName: req.body.userName}, function(err, account){
    if (!account){
      res.status(401).json("Account not exsited");
    }
    else {
      if (err){
        res.status(401).json("Some errors occured");
      }
      res.json(account);
    }
  })
};

//Update account identified by the name in the request (Not update password)
exports.update = function(req,res){
  if (!req.body){
    return res.json("Content cannot be empty");
  }

  // Find accout and update it with the request body 
  account.findOneAndUpdate({userName: req.body.userName}, req.body, {new: true}, function(err, account){
    if (!account){
      return res.status(401).json("Account not existed");
    }
    else {
      if (err){
        return res.status(401).json("Some error occured");
      }
      else {
        return res.status(200).json("Account updated");
      }
    }
  });
};

// Delete account with the speicified userName in the request 
exports.delete = function(req,res){
  account.findOneAndDelete({userName: req.body.userName}, function(err, account){
    if (!account){
      return res.status(401).json("Account not existed");
    }
    else {
      if (err){
        return res.status(401).json("Some error occured");
      }
      else {
        return res.status(200).json("Account deleted");
      }
    }
  });
};

// Login 
/*exports.login = function(req,res){
  account.findOne({userName: req.body.userName}).then(function(account){
    if(!account){
      return res.status(401).json("Username not existed");
    }
    else{
      if(!account.comparePassword(req.body.password)){
        return res.status(401).json("Wrong password");
      }
      else {
        return return res.status(200).json({token: jwt.sign({ email: account.email, userName: account.userName}, 'RESTFULAPIs')});
      }
     
  }.catch(function(err){
    if (err) {
      res.json("Some errors occured");
    }
  });
});
};

// Change Password 
exports.changePassword = function(req, res){
  account.findOneAndUpdate({userName: req.params.userName}, account.password = bcrypt.hash(req.body.newpassword), {new:true}).then(function(err){
    if (err)
      return res.json(401);
    else return res.json(200);
  }); 
};*/


