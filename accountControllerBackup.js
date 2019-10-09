var account = require ("./accountModel.js");
var bcrypt = require ("bcrypt");
// Create and save account
exports.create = function(req,res){
  if (!req.body) {
    return res.status(400).send({
      message :"account content can not be empty"
    });
  }
  account.findOne({userName: req.body.userName}, function(err, user){
    if (user != null) {
      res.json("Username existed, please choose another name");
    }
    });

  // Create a new account 
  var newAccount = new account(req.body);

  // Hash password 
  bcrypt.hash(newAccount.password, 10, function (err, hash){
    if (err) res.json("error");
    newAccount.password = hash;

  });

  // Save account in the database 

  newAccount.save().then(function (data){
    res.json(newAccount.password);
  }).catch (function (err){
    res.json("Some errors occured");
});

// Retrieve and return all accounts from database 
exports.findAll = function(req,res){

  account.find().then(function(account){
    res.json(account);
  }).catch(function(err){
    res.status(500).send({
      message: "Some errors accured "
    });
  });

};

//Find a single account with a userName 
exports.findOne = function(req,res){
  account.findOne({userName: req.params.userName}).then(function(account){
    if (!account){
      return res.json("Account not existed, please register a new one ");
    }
    res.json(account);

  }).catch(function(err){
    if (err.kind == "name"){
      return res.status(404).send({
        message: "account not found with name: " //+ req.params.userName
      });
    }
    return res.status(500).send({
      message: "Error retrieving account with name: " + req.params.userName
    });
  });
};

//Update account identified by the name in the request 
exports.update = function(req,res){
  if (!req.body){
    return res.status(400).send({
      message: "Content can not be empty"
    });
  }

  // Find accout and update it with the request body 
  account.findOneAndUpdate({userName:req.params.userName}, {
    password: req.params.password,
    userName: req.params.userName,
    email: req.params.email,
    phoneNumber: req.params.phoneNumber,
    fullName: req.params.fullName
  }, {new: true}).then(function(account){
    if (!account){
      res.status(404).send({
        message: "Account not found with name: " + req.params.userName
      });
    }
    res.send(account);
  }).catch(function(err){
    if (err.kind =="ObjectName"){
      return res.status(404).send({
        message: "Account not found with name: " + req.params.userName
      });
    }
    return res.status(500).send({
      message: "Error updating account: " + req.params.usreName
    });
  });


};

// Delete account with the speicified userName in the request 
exports.delete = function(req,res){
  account.findOneAndRemove(req.userName).then(function(account){
    if (!account){
      return res.send(404).send({
        message: "Account not found with userName: " + req.params.userName
      });
    }
    res.send({message: "Account deleted"});
  }).catch(function(err){
    if (err.kind == "NotFound"){
      return res.status(404).send({
        message: "Account not found with name: " + req.params.userName
      });
    }
    return res.status(500).send({
      message: "Could not delete, some errors accured with name: " + req.params.userName
    });
  })
};

/*exports.login = function(req,res){
  account.findOne({userName: req.body.userName, password: req.body.password}).then(function(account){
    if(!account){
      return res.json("Account not existed, please register a new one");
    }
    res.json("Login successfully");
  }).catch(function(err){
    if (err) {
      res.json("Some errors occured");
    }
  });
}; */


