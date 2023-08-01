const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes');
const path = require('path');
const Database = require('./database');
const cookieParser = require('cookie-parser')

const db = new Database('harrypotter.db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.set('views', './views');
app.use('/static', express.static(path.resolve('static')));

app.use(routes(db));

app.all('*', (req, res) => {
    return res.status(404).send({
        message: '404 page not found'
    });
});



(async () => {
    await db.connect();
    await db.migrate();

    app.listen(4000, () => console.log('Listening on port 4000'));
})();
