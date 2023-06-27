const path              = require('path');
const fs                = require('fs');
const express           = require('express');
const router            = express.Router();
const cookieParser      = require('cookie-parser')
const Crypto            = require('crypto')
const http = require('http');
const https = require('https');
//const WeatherHelper     = require('../helpers/WeatherHelper');

let db;

const response = data => ({ message: data });

router.get('/', (req, res) => {
	res.clearCookie("authtoken");
	return res.sendFile(path.resolve('views/login.html'));
});

router.get('/homepage', (req, res) => {
	console.log("cookies="+JSON.stringify(req.cookies));
	//console.log(req.cookies.length);
	if(JSON.stringify(req.cookies) == "{}")
		//return res.sendFile(path.resolve('views/login.html'));	
		res.redirect("/login");
	else
		return res.sendFile(path.resolve('views/homepage.html'));
	//return res.sendFile(path.resolve('views/homepage.html'));
});

router.get('/register', (req, res) => {
	return res.sendFile(path.resolve('views/registration.html'));
});

router.post('/register', (req, res) => {
	console.log("Hello there")
	console.log("socket remote address="+req.socket.remoteAddress.replace(/^.*:/, ''));
	if (req.socket.remoteAddress.replace(/^.*:/, '') != '127.0.0.1') {
		return res.status(401).end();
	}

	let { email, username, password } = req.body;

	if (email && username && password) {
		return db.register(email, username, password)
			.then(()  => res.send(response('Successfully registered')))
			.catch(() => res.send(response('Something went wrong')));
	}

	return res.send(response('Missing parameters'));
});

router.get('/login', (req, res) => {
	res.clearCookie("authtoken");
	return res.sendFile(path.resolve('views/login.html'));
});

router.post('/login', (req, res) => {
	let { email, password } = req.body;

	console.log(email+" "+password)
	if (email && password) {
		return db.isUser(email, password)
			.then(result => {
				//console.log("result = "+result);
				if(result) {
					//console.log("result = "+result)
					return db.isAdmin(email, password)
						.then(admin => {
							if (admin) 
								return res.send(fs.readFileSync('/app/flag').toString());
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

router.post('/api/getCharacterDetails', (req, res) => {
	let { chname, endpoint } = req.body;
	if (chname && endpoint) {


		return db.getCharacterData(chname, endpoint)
			.then(result => {
				console.log("result = "+result.name)
				return res.send({'message':'Found', 'data':result})
			})


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
	}
	else
		return res.send(response('Missing parameters'));
});	

router.post('/api/getAllChars', (req,res) => {
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