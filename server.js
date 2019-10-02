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
                    acc.role = "khachhang";
                    var date = new Date();
                    acc.date = (date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " @ " + date.getHours() + ":" + date.getMinutes()).toString();
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
									name: 'login with token',
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
        // thay doi mat khau, gui len username, password, passwordchange
        app.post('/user/changepassword', function (req, res) {
            var request = req.body;
            collection.find({ username: request.username, password: request.password }).toArray(function (err1, resl)
            {
                if (Array.isArray(resl) && (resl.length == 0))
                    res.status(401).send('Wrong Password')
                else {
                    if (request.passwordchange == null) res.status(401).send('Password not null')
                    else {

                        collection.update({ username: request.username, password: request.password },
                            { $set: { password: request.passwordchange } }, function (err2, reslt)
                            {
                                if (err2) throw err2;
                                res.status(200).send("password updated");
                            })
                    }
                }
            })
        });
        // them quyen nhan vien cho user. chi co admin moi co quyen nang cap user tu khach hang len nhanvien. Gui len user Admin va username nang cap
        app.post('/user/upgraderole', function (req, res) {
            var acc = req.body;
            collection.find({ username: acc.username }).toArray(function (err, docs) {
                if (Array.isArray(docs) && docs.length != 0)     // tim thay
                {
                    // add vao database
                    if (docs[0].role == "Admin") {
                        collection.find({ username: acc.usernameupdate }).toArray(function (err1, resl) {
                            if (Array.isArray(resl) && resl.length == 0) res.status(401).send("Find not found " + acc.usernameupdate);
                            else {
                                if (resl[0].role == "nhanvien") res.status(401).send("User " + resl[0].username + "da la nhan vien ");
                                else 
                                collection.update({ username: acc.usernameupdate }, { $set: { role: "nhanvien" } }, function (err2, reslt) {
                                    if (err2) res.status(401).send(err2);
                                    res.status(200).send("Upgrade seccess");
                                })
                            }
                        });
                    }
                    else res.status(401).send("Permission error. You need login with account Administrator ");
                }
                else res.status(401).send("User not found");
            })
        })
        // in ra danh sach tat ca cac user gom thong tin username, role. Chi co admin moi co quyen in
        app.get('/user/finduser', function (req, res) {
            collection.find({ username: req.body.username }).toArray(function (err, docs) {
                if (Array.isArray(docs) && docs.length != 0)     // tim thay
                {
                    // kiem tra admin, chi co admin moi co quyen xuat thong tin user
                    if (docs[0].role == "Admin") {
                        collection.find({}, { _id: 0, username: 1, role: 1 }).toArray(function (err1, resl) {
                            if (err1) res.status(401).send(err1);
                            res.status(200).send(resl);
                        }); // tuong lai se find xuat them anh dai dien
                    }
                    else res.status(401).send("Permission error. You need login with account Administrator ");
                }
                else res.status(401).send("User not found");
            })
        })
	app.post('/user/uploadimage', function (req, res) {
            if (req.headers && req.headers.authorization) {
                var token = req.headers.authorization;      // doc gia tri token
                if (!token)
                    return res.status(403).send({ auth: false, message: 'No token provided.' });
                jwt.verify(token, config.secret, function (err, decoded) {  // gia ma token thanh decoded la obj
                    if (err)
                        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                    // sau khi giai ma token ta duoc ten username. tim username trong database de response
                    collection.find({ username: decoded.username }).toArray(function (err, docs) {
                        if (Array.isArray(docs) && docs.length != 0) {
                            let formidable = require('formidable');
                            var form = new formidable.IncomingForm();
                            form.uploadDir = "./uploads";   // thu muc luu
                            form.keepExtensions = true;     // duoi file
                            form.maxFieldsSize = 10 * 1024 * 1024;  // kich thuoc
                            form.multiples = false; //cho phep gui nhieu file

                            form.parse(req, function (err2, fields, files) {
                                if (files.image === undefined || files.image === null) res.status(401).send("No image to upload");

                                if (err2) {
                                    res.status(401).send("Cannot upload image. Error is " + err2);
                                }
                                let url = files.image.path;
                                collection.update({ username: docs[0].username }, { $set: { imageurl: url } }, function (err3, reslt) {
                                    if (err3) res.status(401).send(err3);
                                    else res.status(200).send("Upload Image Successfully");
                                });
                            });
                        }
                    });

                });
                    }
            })
        app.get('/user/openimage', function (req, res)
        {
            if (req.headers && req.headers.authorization) {
                var token = req.headers.authorization;      // doc gia tri token
                if (!token)
                    return res.status(403).send({ auth: false, message: 'No token provided.' });
                jwt.verify(token, config.secret, function (err, decoded) {  // gia ma token thanh decoded la obj
                    if (err)
                        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                    // sau khi giai ma token ta duoc ten username. tim username trong database de response
                    collection.find({ username: decoded.username }).toArray(function (err, docs) {
                        if (Array.isArray(docs) && docs.length != 0) {
                            fs.readFile(docs[0].imageurl, function (err, imagedata) {
                                if (err) res.status(401).send("Cannot read image. Error: " + err);
                                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                                res.end(imagedata);
                            })
                        }
                    })
                })
            }
        })
	// dang bi loi Email khong cho su dung http dang nhap
        app.post('/user/forgotpassword', function (req, res)
        {
            collection.find({ username: req.body.username }).toArray(function (err, docs) {
                if (Array.isArray(docs) && docs.length != 0)  // tim thay
                {
                    if (docs[0].email === undefined) res.status(401).send("Username: " + req.body.username + " chua cap nhat dia chi email");
                    var accmail = 'partyuitk11@gmail.com';
                    var passmail = 'partyuit123';
                    var smtptransport = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: accmail, // user password email de dang nhap va gui 
                            pass: passmail
                        }
                    })
                    var token = jwt.sign({ email: req.body.email }, config.secret, {
                        expiresIn: '1h'
                    });
                    var data = {
                        from: accmail,
                        to: docs[0].email,
                        subject: "Reset Password",
                        context: {
                            url: 'http://localhost:3000/user/forgotpasswordcheck?token=' + token,
                            name: docs[0].username
                        }
                    };
                    smtptransport.sendMail(data, function (err) {
                        if (err) res.status(401).send("Error: " + err);
                        res.status(200).send("Please check your email");
                    })
                }
                else res.status(401).send("Find not found username: " + req.body.username);
            })
        })
        app.post('/user/forgotpasswordcheck', function (req, res)
        {
            if (req.headers && req.headers.authorization) {
                var token = req.headers.authorization;      // doc gia tri token
                if (!token)
                    return res.status(403).send({ auth: false, message: 'No token provided.' });
                jwt.verify(token, config.secret, function (err, decoded) {  // gia ma token thanh decoded la obj
                    if (err)
                        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                    // sau khi giai ma token ta duoc ten username. tim username trong database de response
                    collection.find({ email: decoded.email }).toArray(function (err, docs) {
                        if (Array.isArray(docs) && docs.length != 0) {
                            collection.update({ username: docs[0].username },
                                { $set: { password: req.body.passnew } }, function (err2, reslt) {
                                    if (err2) throw err2;
                                    res.status(200).send("Password updated");
                                });
                        }
                    })
                })
            }
        })
});
var server=app.listen(1111);

