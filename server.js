const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.use(express.static('public'))
app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/index.html');
    res.send('index.html');
});

// Socket.IO
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, peerId) => {
        socket.join(roomId);
        socket.to(roomId).emit('peer-connected', peerId);
        //console.log('[socket.io] Peer connected: ' + peerId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('peer-disconnected', peerId);
            //console.log('[socket.io] Peer disconnected: ' + peerId);
        })
    })
})

// PeerJs
// PeerServer
const { PeerServer } = require('peer');
const peerServer = PeerServer({ port: 3001, path: '/peerjs' });

// server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});
