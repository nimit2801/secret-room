import express from 'express'
const app = express();
import { ExpressPeerServer } from 'peer';
import http from 'http';
import cors from 'cors'
import {v4} from 'uuid'
const server = http.createServer(app);
import {Server} from 'socket.io'
import morgan from 'morgan'
const io = new Server(server);
import chalk from 'chalk'


// Socket Connection and logic
io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userID) =>{
    console.log(`${userID} joined this ${roomId}`)
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userID)
  
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userID)
    })
  }

)})

// EJS setup
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cors({
  origin: 'https://325a-8-34-69-70.ngrok.io'
}))
app.use(morgan(chalk.green(':method :http-version :url :status :response-time ms :user-agent')))


// Routes Setup
app.get('/', (req, res) => {
  res.redirect(`/${v4()}`)
});

app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room})
})

app.get('/test/development', (req, res) => {
  res.render('development')
})

server.listen(3000, () => {
  console.log(chalk.yellow('listening on http://localhost:3000'));
});

// Integrate peerjs
const peerServer = ExpressPeerServer(server, {
  debug: true
})

app.use('/api/peerjs', peerServer)