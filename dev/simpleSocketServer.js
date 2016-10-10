
/*var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ServerLog = require('./../dist/serverLog').default;
var path = require('path');

var serverLog = new ServerLog(path.resolve(__dirname + '/../logs'));
var router = express.Router();

router.get('/', function(req, res){
    res.send('hello');
});

app.use('/', router);

io.on('connection', function(socket){

    console.log('a user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('log', function(msg){
        var msg = JSON.parse(msg);
        serverLog.log(msg.type, msg.args);
    });

    socket.on('rendered', function(content){

        console.log('rendered: ' , content.uid);
        //check if should cache or not, store if necessary
        socket.emit('rendered_' + content.uid, 'ok');

    });

});


http.listen(3333, function(){
    console.log('listening on *:3333');
});

*/

var SocketServer = require('./../dist/socketServer').default;

var server = new SocketServer(3333);
server.start();