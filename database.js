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