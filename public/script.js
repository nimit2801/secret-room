const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined,   {
    secure: true,    
    host: '/', // when running on localhost
    path: '/api/peerjs',
    // port: '3000' // when running on localhost
    // host: "325a-8-34-69-70.ngrok.io", // when running on peer on server
    port: '443', // when running on peer on server
 
})

// const callme = async() => {

//     let a = await fetch('https://jsonplaceholder.typicode.com/todos/1')
//     console.log(await a.json())
// }
// callme()

const myVideo = document.createElement('video')
myVideo.muted = true
console.log(myVideo.outerHTML)

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    console.log("call ke aage hi nai aaya")
    socket.on('user-connected', userId => {
        console.log('User Connected ' + userId)
        connectToNewUser(userId, stream)
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-connected', userId => {
    console.log('User Connected ' + userId)
})

socket.on('user-disconnected', userId => {
    console.log("user disconnected: " + userId)
    if(peers[userId])  peers[userId].close()
})

function connectToNewUser(userId, stream) {
    console.log('User Connected ' + userId)
    
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.appendChild(video)
    console.log("playing your video now!")
}

function createButton(myVideo){
    const myButton = document.createElement('button')
    myButton.textContent = "unmute"
    if(myVideo){
        myButton.onClick = () => { 
            myVideo.muted = false
    }}    
}