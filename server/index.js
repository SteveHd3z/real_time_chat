import express from 'express';
import logger from 'morgan';

import { Server } from 'socket.io';
import { createServer } from 'http';


const port= process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io= new Server(server)

io.on('connection', (socket) => {
    console.log('A user has connected')

    socket.on('disconnect', () => {
        console.log('A user has disconnected')
    })
})

app.use(logger('dev'));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')  
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
