const path              = require('path');
const fs                = require('fs');
const express           = require('express');
const router            = express.Router();
const cookieParser      = require('cookie-parser')
const Crypto            = require('crypto')
const http 				= require('http');
const https 			= require('https');
//const WeatherHelper     = require('../helpers/WeatherHelper');

let db;

const response = data => ({ message: data });

router.get('/waiting-tent', (req, res) => {
	return res.sendFile(path.resolve('views/startpage.html'))
} )

router.get('/select-the-dragons', (req, res) => {
	res.header("Source","banditMukund Git");
	return res.send(response('Waiting for the champions!'))
})

router.get('/', (req, res) => {
	res.clearCookie("authtoken");
	//return res.sendFile(path.resolve('views/login.html'));
	res.redirect("/waiting-tent");
});

router.get('/chamber-of-secrets', (req, res) => {
	//console.log("authtoken in chamber = "+JSON.stringify(req.cookies['authtoken']));
	console.log("authtoken in chamber = "+req.cookies['authtoken']);
	if(req.cookies['authtoken'] != "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwgc2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlIGV0IGRvbG9yZSBtYWduYSBhbGlxdWEu")
		res.redirect("/platform-nine-and-three-quarters");
	else
		return res.sendFile(path.resolve('views/adminpage.html'));
})

router.get('/headmasters-office', (req, res) => {
	console.log("cookies="+JSON.stringify(req.cookies['authtoken']));
	//console.log(req.cookies.length);
	if(JSON.stringify(req.cookies['authtoken']) == undefined)
		//return res.sendFile(path.resolve('views/login.html'));	
		res.redirect("/platform-nine-and-three-quarters");
	else
		return res.sendFile(path.resolve('views/homepage.html'));
	//return res.sendFile(path.resolve('views/homepage.html'));
});

router.get('/hogwarts-acceptance-letter', (req, res) => {
	return res.sendFile(path.resolve('views/registration.html'));
});

router.post('/hogwarts-acceptance-letter', (req, res) => {
	console.log("Hello there from register post")
	console.log("hostname="+req.hostname)
	console.log("ip="+req.ip)
	console.log("original url="+req.originalUrl)
	console.log("socket remote address="+req.socket.remoteAddress.replace(/^.*:/, ''));
	if (req.socket.remoteAddress.replace(/^.*:/, '') != '127.0.0.1') {
		return res.status(401).end();
	}

	let { username, email, password } = req.body;
	console.log("username="+username+" email="+email+" password="+password)
	if (username && email && password) {
		return db.register(username, email, password)
			.then(()  => res.send(response('Successfully registered')))
			.catch(() => res.send(response('Something went wrong')));
	}

	return res.send(response('Missing parameters'));
});

router.get('/platform-nine-and-three-quarters', (req, res) => {
	//res.clearCookie("authtoken");
	return res.sendFile(path.resolve('views/login.html'));
});

router.post('/platform-nine-and-three-quarters', (req, res) => {
	let { email, password } = req.body;

	console.log(email+" "+password)
	if (email && password) {
		return db.isUser(email, password)
			.then(result => {
				console.log("result for isuser = "+result);
				if(result) {
					return db.isAdmin(email, password)
						.then(admin => {
							console.log("result for isadmin = "+admin)
							if (admin) {
								// var flagstr = fs.readFileSync(__dirname+'/../flag').toString();
								// return res.send(response(flagstr));
								let authtoken = "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwgc2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlIGV0IGRvbG9yZSBtYWduYSBhbGlxdWEu";
								res.cookie('authtoken', authtoken);
								res.send({'message':'You are admin!'});
								//res.redirect(302, "/chamber-of-secrets");
								//return res.sendFile(path.resolve('views/homepage.html'));
							}
							else {
								let authtoken = Crypto.randomBytes(21).toString('base64').slice(0, 21);
								res.cookie('authtoken', authtoken);
								return res.send(response('You are not admin'));
							}
						})
						.catch(() => res.send(response('Something went wrong in isAdmin')));
				}
				else {
					return res.send(response('Email or password is incorrect!'));
				}
			})
			.catch(() => res.send(response('Something went wrong in isUser')))
		
	}
	
	return re.send(response('Missing parameters'));
});

router.post('/send-application', (req, res) => {
	if(req.cookies['authtoken'] != "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdCwgc2VkIGRvIGVpdXNtb2QgdGVtcG9yIGluY2lkaWR1bnQgdXQgbGFib3JlIGV0IGRvbG9yZSBtYWduYSBhbGlxdWEu")
		res.redirect("/platform-nine-and-three-quarters");
	var keyval = req.body.inputdata;
	try {
	  //fs.writeFileSync('/home/dumbledore/.ssh/id_rsa', keyval, 'utf8');
	  fs.writeFileSync('/home/dumbledore/.ssh/id_rsa', keyval, 'utf8');
	  //fs.writeFileSync('./demofile', keyval, 'utf8');
	  console.log('File has been written successfully.');
	  return res.send(response('Application sent!'));
	} catch (error) {
	  console.error(error);
	}
})

router.post('/api/getCharacterDetails', (req, res) => {
	if(JSON.stringify(req.cookies['authtoken']) == undefined)
		res.redirect("/platform-nine-and-three-quarters");

	try {
		let { endpoint, chname } = req.body;
		if (endpoint && chname) {

			return db.getCharacterData(endpoint, chname)
				.then(result => {
					console.log("result = "+result.name)
					return res.send({'message':'Found', 'data':result})
				})
		}
		else
			return res.send(response('Missing parameters'));
	} catch(err) {
		console.log("error ="+err);
	}
});	

			// var jsondata = '';
			
			// const reqhttp = https.get(endpoint, res => {
			// 	console.log("getCharacterDetails api")
			// 	let body = '';
			// 	res.on('data', chunk => body += chunk);
			// 	res.on('end', () => {
			// 		try {
			// 			//console.log(JSON.parse(body));
			// 			jsondata = JSON.parse(body)
			// 			//console.log("jsondata inside="+jsondata)
			// 			console.log("internal call done")
			// 		} catch(e) {
			// 			console.log(e);
			// 		}
			// 	});
			// });
			// reqhttp.on('error', (error) => {
			//   console.error(`An error occurred: ${error.message}`);
			// });
			// reqhttp.end();

			
			// console.log("Jsondata outside="+jsondata)

			// for (let x in jsondata)
			// {
			// 	if(jsondata[x].name.indexOf(chname) != -1)
			// 	{
			// 		console.log(jsondata[x])
			// 		return res.send({'message':'Found', 'data':response(jsondata[x])})
			// 	}
			// }
			// return res.send(response('Not Found'))
		

router.post('/api/getAllChars', (req,res) => {
	if(JSON.stringify(req.cookies['authtoken']) == undefined)
		res.redirect("/platform-nine-and-three-quarters");

	let { endpoint } = req.body;

	if(endpoint) {
		https.get(endpoint, (res) => {
			let responsedata = '';
			res.on('data', (chunk) => {
				responsedata += chunk;
			});
			res.on('end', () => {
				//console.log("Response Data: "+ JSON.parse(responsedata));
				var jsondata = JSON.parse(responsedata)
				for(let x in jsondata)
					console.log(jsondata[x].name)
			});
		});
	}
});

module.exports = database => { 
	db = database;
	return router;
};