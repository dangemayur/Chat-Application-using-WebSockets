const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
const io = require('socket.io')(server);


app.use(express.static(path.join(__dirname, 'public')));

const socketsConnected = new Set();


io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socketsConnected.add(socket.id);


    io.emit('clients-total', socketsConnected.size);


    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        socketsConnected.delete(socket.id);

        io.emit('clients-total', socketsConnected.size);
    });


    socket.on('message', (data) => {
       
        const sanitizedData = {
            name: sanitizeInput(data.name),
            message: sanitizeInput(data.message),
            dateTime: data.dateTime,
        };

        console.log(`Received message from ${sanitizedData.name}: ${sanitizedData.message}`);

        
        socket.broadcast.emit('chat-message', sanitizedData);
    });


    socket.on('feedback', (data) => {
        console.log(`Received feedback: ${data}`);
        socket.broadcast.emit('feedback', data);  
    });
});


function sanitizeInput(input) {
    return String(input).replace(/[<>]/g, '');
}
