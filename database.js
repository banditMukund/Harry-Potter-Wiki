const sqlite = require('sqlite-async');
const crypto = require('crypto');
const https = require('https');

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
                email      VARCHAR(255) NOT NULL UNIQUE,
                username   VARCHAR(255) NOT NULL,
                password   VARCHAR(255) NOT NULL
            );

            INSERT INTO users (email, username, password) VALUES ('admin', 'admin', '${ crypto.randomBytes(32).toString('hex') }');
            INSERT INTO users (email, username, password) VALUES ('test@email.com', 'test1', 'test1');
        `);
    }

    async register(email, user, pass) {
        // TODO: add parameterization and roll public
        return new Promise(async (resolve, reject) => {
            try {
                let query = `INSERT INTO users (email, username, password) VALUES ('${email}', '${user}', '${pass}')`;
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

    async getCharacterData(chname, endpoint) {
        console.log("Character data in database");
        return new Promise(async (resolve, reject) => {
            try {
                const req = await https.get(endpoint, res => {
                    let body = '';
                    res.on('data', chunk => body+=chunk);
                    res.on('end', () => {
                        let jsondata = JSON.parse(body)
                        let theres = ''
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
                        //console.log("theres="+theres.name)
                        resolve(false);
                        // if(theres='')
                        //     resolve(false)
                        // else
                        // {
                        //     console.log("else condition theres="+theres.name)
                        //     resolve(theres)
                        // }
                    })
                })
            } catch(e) {
                reject(e)
            }
        });
    }
}
    


module.exports = Database;