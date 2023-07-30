const sqlite = require('sqlite-async');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

class Database {
    constructor(db_file) {
        this.db_file = db_file;
        this.db = undefined;
    }
    
    async connect() {
        this.db = await sqlite.open(this.db_file);
    }

    async migrate() {
        return this.db.exec(`
            DROP TABLE IF EXISTS users;

            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                username   VARCHAR(255) NOT NULL,
                email      VARCHAR(255) NOT NULL UNIQUE,
                password   VARCHAR(255) NOT NULL
            );

            INSERT INTO users (username, email, password) VALUES ('admin', 'admin', '${ crypto.randomBytes(32).toString('hex') }');
            INSERT INTO users (username, email, password) VALUES ('test1', 'test@email.com', 'test1');
        `);
    }

    async register(user, email, pass) {
        // TODO: add parameterization and roll public
        return new Promise(async (resolve, reject) => {
            try {
                let query = `INSERT INTO users (username, email, password) VALUES ('${user}', '${email}', '${pass}')`;
                resolve((await this.db.run(query)));
            } catch(e) {
                reject(e);
            }
        });
    }

    async isUser(email, pass) {
        console.log("In is User : email="+email+",pass="+pass);
        return new Promise(async (resolve, reject) => {
            try {
                let smt = await this.db.prepare(`SELECT * FROM users WHERE email= ? and password = ?`);
                let row = await smt.get(email,pass);
                console.log("row="+row)
                resolve(row !== undefined)
            } catch(e) {
                reject (e);
            }
        });
    }

    async isAdmin(email, pass) {
        console.log("In is Admin")
        return new Promise(async (resolve, reject) => {
            try {
                let smt = await this.db.prepare('SELECT * FROM users WHERE email = ? and password = ?');
                let row = await smt.get(email, pass);
                resolve(row !== undefined ? row.email == 'admin' : false);
            } catch(e) {
                reject(e);
            }
        });
    }

    async getCharacterData(endpoint, chname) {

        // var postData = "email=admin&username=admin&password=123"

        // const options = {
        //   hostname: '192.168.1.9', // The server's hostname or IP address
        //   port: 80, // The port of the server
        //   path: '/hogwarts-acceptance-letter', // The path or route on the server to which the request will be made
        //   method: 'POST', // The HTTP method (POST in this case)
        //   headers: {
        //     'Content-Type': 'text/x-www-form-urlencoded', // Set the content type of the request body
        //     'Content-Length': Buffer.byteLength(postData) // Set the content length of the request body
        //   }
        // };

        // const req = http.request(options, (res) => {
        //   // Event handler for the 'response' event
        //   console.log(`Status Code: ${res.statusCode}`);
          
        //   res.on('data', (chunk) => {
        //     // Event handler for the 'data' event when the response data is received
        //     console.log(`Received data: ${chunk}`);
        //   });

        //   res.on('end', () => {
        //     // Event handler for the 'end' event when the response has ended
        //     console.log('Response ended.');
        //   });
        // });

        // req.on('error', (error) => {
        //   // Event handler for the 'error' event in case of any errors
        //   console.error(`Error occurred: ${error.message}`);
        // });

        // // Send the POST request with the provided data
        // req.write(postData);

        // // End the request (this is required to signal that the request data is complete)
        // req.end();

        console.log("Character data in database");
        return new Promise(async (resolve, reject) => {
            
                let url = endpoint + "/api/characters";
                console.log("endpoint url="+url);
                const protocol = url.startsWith('http://') ? http : https;
                await protocol.get(url, res => {
                    let body = '';
                    res.on('data', chunk => body+=chunk);
                    res.on('end', () => {
                        try {
                            let jsondata = JSON.parse(body)
                            let theres = ''
                            //console.log("jsondata="+jsondata);
                            for (let x in jsondata)
                            {
                                if(jsondata[x].name.indexOf(chname) != -1)
                                {
                                    theres=jsondata[x];
                                    console.log("found = "+theres.name)
                                    resolve(theres)
                                    break;
                                }
                            }
                        } catch(e) {
                            resolve(false);
                        }
                    });
                }).on('error', reject);
        });
    }
}
    


module.exports = Database;