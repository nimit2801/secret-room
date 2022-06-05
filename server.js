// const express = require('express');
import express from 'express'
const app = express();
// const {ExpressPeerServer} = require('peer')
import { ExpressPeerServer } from 'peer';
// const http = require('http');
import http from 'http';
// const cors = require('cors');
import cors from 'cors'
// const {v4: uuidV4} = require('uuid')
import {v4} from 'uuid'
const server = http.createServer(app);
// const { Server } = require("socket.io")
import {Server} from 'socket.io'
// const morgan = require('morgan')
import morgan from 'morgan'
const io = new Server(server);
// const chalk = require('chalk')
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

server.listen(3000, () => {
  console.log(chalk.yellow('listening on http://localhost:3000'));
});

// Integrate peerjs
const peerServer = ExpressPeerServer(server, {
  debug: true
})

app.use('/api/peerjs', peerServer)