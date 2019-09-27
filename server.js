var express=require('express');
var app=express();
var mongodb=require('mongodb');
var bodyParser = require('body-parser');// dung khai bao de doc res.body
var jwt=require('jsonwebtoken');
var config=require('./config');
var brcypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());

// khai bao database
var MongoClient=mongodb.MongoClient;
MongoClient.connect(
	'mongodb://localhost/Android_Lab',      // connect local
    //'mongodb+srv://Admin:androidlab123@android-lab-7mcp8.mongodb.net/test?retryWrites=true&w=majority', 
	function (err,db) 
	{
		if (err) console.log("Unable to connect")
		else 
		{
			console.log(" Ket noi thanh cong");
		};
		// ket noi toi collection User
		var collection = db.collection("User");
		// API post, tao user

		app.post('/addUser',function(req,res)
		{
			// tim trong database xem co trung hay chua
			collection.find({username:req.body.username}).toArray(function(err, docs) 
			{
				if (Array.isArray(docs) && docs.length===0)     // tim k thay
				{
    			// add vao database
                    var acc = req.body;
                    // ma hoa password
                    //var hashedPassword = brcypt.hashSync(req.body.password, 8);
                    //acc.password = hashedPassword;
                    // insert
					collection.insert(acc,(function(err,reslute)  
					{
						if (err) 
						{
							// insert loi
							console.log(err);
							res.writeHead(401,{ "Content-Type":"application/json"});
							var response =
								{
									success:"false",
									name: 'adduser',
									errorMessage: err,
									username:acc.username,
									account:acc
								};
								// gia tri tra ve response
							res.end(JSON.stringify(response));
						}
						else 
						{ 
							// them thanh cong
                            console.log("Inserted documents into the database");
                            // khong tra ve password
                            delete acc.password;
							var response=
								{	
									success:"true",
									name: 'adduser',
									errorMessage: "null",
									username:acc.username,
									account: acc
								};
							res.writeHead(200, { "Content-Type":"application/json"});
							res.end(JSON.stringify(response));
						}
					}));
				}
				else 
                {
                    // add tai khoan da ton tai, err, send 401
					console.log("Tai khoan da ton tai");
					res.writeHead(401,{ "Content-Type":"application/json"});
                    var response =
                    {
                        success: "false",
                        name: 'adduser',
                        errorMessage: "Tai khoan da ton tai",
                        username: req.body.username,
                        account: req.body
					};
					res.end(JSON.stringify(response));
				}
			})
		});
		// login
		app.post('/login', function (req, res)
        {
            //kiem tra dang nhap bang token 
            if (req.headers && req.headers.authorization) {
                var token = req.headers.authorization;      // doc gia tri token
                if (!token)
                    return res.status(403).send({ auth: false, message: 'No token provided.' });
                jwt.verify(token, config.secret, function (err, decoded) {  // gia ma token thanh decoded la obj
                    if (err)
                        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                    // sau khi giai ma token ta duoc ten username. tim username trong database de response
                    collection.find({ username: decoded.username }).toArray(function (err1, resl) {
                        delete resl[0].password;
                        var response =
                        {
                            token: token,
                            success: "true",
                            name: 'login',
                            errorMessage: err,
                            username: decoded.username,
                            account: resl[0]
                        }
                        res.status(200).send(response);
                    });    
                });
            }
            else 
                // login with user and password
			collection.find({username:req.body.username}).toArray( function(err, user)
			{
				if (Array.isArray(user) && user.length==0)  res.status(401).send('Login failed, user not found');
				else 
				{
					collection.find({username:req.body.username,password: req.body.password}).toArray(function (err1, resl)
					{
						if (Array.isArray(resl) && resl.length==0)
							res.status(401).send('Wrong Password')
						else 
						{
							// create token
							var token =jwt.sign({username:req.body.username}, config.secret,	{
									expiresIn: '24h'
                            });
                            delete resl[0].password;
								var response =
								{
									token: token,
									success:"true",
									name: 'login',
									errorMessage: err,
									username:req.body.username,
									account:resl[0]
								}
							
							res.status(200).send(response);

						}

					});
				}
			});
			
		}); 
	});
var server=app.listen(1111);

// ý tưởng gửi và nhận pass
// lúc khởi tạo tài khoản client send pass lên, server nhận pass, băm pass rồi lưu vào database
// lúc login, client gửi pass đã băm lên server, server kiểm tra pass đã băm với pass trong database