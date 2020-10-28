const express = require('express');
var router = express.Router();
const port = process.env.PORT || 3000;

module.exports = router ;
var routes = require('./routes/index');

const server=express();
server.set('view engine', 'ejs');

server.use('/', routes);

server.listen(port, ()=>{
    console.log('server started at port 3000');
});
