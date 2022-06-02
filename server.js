const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const {v4: uuidV4} = require('uuid')
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = new Server(server);

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
  origin: 'http://c1df-49-36-95-9.ngrok.io'
}))

// app.use(cors({
//   origin: "*"
// }))

//Routes Setup
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
});

app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room})
})

  


server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});