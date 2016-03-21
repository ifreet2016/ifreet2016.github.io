var express = require('express');
var path = require('path');
var app = express();
var http = require('https');

console.log(path.join(__dirname, '/assets/js'));
app.use('/assets', express.static(path.join(__dirname, '/assets/js')));
app.use('/css', express.static(path.join(__dirname, '/assets/css')));
app.use('/img', express.static(path.join(__dirname, '/assets/img')));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/req', function (req, res) {

    var options = {
        host: 'api.twitch.tv',
        port: 443,
        path: '/kraken/search/streams?q=uncharted',
        method: 'GET'
    };

    http.request(options, function(response) {
        // console.log('STATUS: ' + response.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            res.json(chunk);
        });
    }).end();


});

app.listen(3000);
