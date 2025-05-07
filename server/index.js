import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';    //dotenv es un modulo que nos permite cargar variables de entorno desde un archivo .env
import { createClient } from '@libsql/client'; //importamos el cliente de libsql para poder usarlo en el servidor

import { Server } from 'socket.io';//importamos socket.io para poder usarlo en el servidor
//importamos el servidor http para poder usarlo con socket.io
import { createServer } from 'http';

dotenv.config(); //cargamos las variables de entorno desde el archivo .env

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

const db=createClient({
    url:"libsql://db-chat-stevehd3z.aws-us-east-1.turso.io",
    authToken:process.env.DB_TOKEN,
})

await db.execute(`CREATE TABLE IF NOT EXISTS messages 
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
     content TEXT)`)

//Configuramos el socket.io para que escuche las conexiones
//cuando un cliente se conecta, se ejecuta la funcion de callback
io.on('connection', (socket) => {
    console.log('A user has connected')

    socket.on('disconnect', () => {
        console.log('A user has disconnected')
    })
    
    socket.on('chat message', async (msg) => {        //cuando el cliente envia un mensaje, se ejecuta la funcion de callback
        let result
        try{
            result= await db.execute({
                sql: `INSERT INTO messages (content) VALUES (:msg)`,
                args: {msg} //insertamos el mensaje en la base de datos
        }) //insertamos el mensaje en la base de datos

        }catch(e){
            console.error(e)
            return
        }

        io.emit('chat message', msg, result.lastInsertRowid.toString())            //emitimos el mensaje a todos los clientes conectados
    })
})

app.use(logger('dev'));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')  
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
