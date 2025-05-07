import express from 'express';
import logger from 'morgan';

import { Server } from 'socket.io';//importamos socket.io para poder usarlo en el servidor
//importamos el servidor http para poder usarlo con socket.io
import { createServer } from 'http';

//Puerto que vamos a utilizar
const port= process.env.PORT || 3000;

//creamos la conexion tanto del servidor como de socket.io
//creamos el servidor http y le pasamos la app de express
const app = express();
const server = createServer(app);

//creamos el servidor de socket.io y le pasamos el servidor http
//esto es necesario para que socket.io funcione con express
const io= new Server(server, {
    connectionStateRecovery:{}
})

//Configuramos el socket.io para que escuche las conexiones
//cuando un cliente se conecta, se ejecuta la funcion de callback
io.on('connection', (socket) => {
    console.log('A user has connected')

    socket.on('disconnect', () => {
        console.log('A user has disconnected')
    })
    
    socket.on('chat message', (msg) => {        //cuando el cliente envia un mensaje, se ejecuta la funcion de callback
        console.log('Message received:', msg)
        io.emit('chat message', msg)            //emitimos el mensaje a todos los clientes conectados
    })
})

app.use(logger('dev'));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')  
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
