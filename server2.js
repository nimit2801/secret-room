const express = require('express');
const app = express();
const cors = require('cors');
// app.use(cors())
// app.options('*', cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
 });
app.get('/', async (req, res) => {
res.send("Working!")
});

app.listen('3005', () => {
    console.log("working on port 3005")
});