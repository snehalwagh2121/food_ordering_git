const express = require('express');
var router = express.Router();
const port = process.env.PORT || 3000;
const favicon = require('serve-favicon');
const path=require('path');
const publicDirectory=path.join(__dirname,'../public');

module.exports = router ;
var routes = require('./routes/index');

const server=express();
server.set('view engine', 'ejs');

server.use(favicon('public/images/favicon.ico'));
server.use(express.static(publicDirectory));

server.use('/', routes);

server.listen(port, ()=>{
    console.log('server started at port 3000');
});
