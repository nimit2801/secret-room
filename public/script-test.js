import './constraints.js'
const socket = io('/')
console.log("in development!")
const videoGrid = document.getElementById('video-grid')
const showBtn = document.getElementById("show-btn")
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");
const changeQuality = document.querySelector("select#changeQuality");
console.log(showBtn)
showBtn.addEventListener("click", getStream)
const stopBtn = document.getElementById("stop-btn")
const callBtn = document.getElementById("call-btn")
stopBtn.addEventListener("click", stopTrack)
callBtn.addEventListener("click", callPeer)
let myVideo = document.createElement('video')
myVideo.muted = true
console.log(myVideo.outerHTML)
let resolution_ = "vgaConstraints"
// Get permission from user to get its devices
getForcePermissions()

let peers = {
    "test": "working"
}

const myPeer = new Peer(undefined,   {
    // secure: true,    
    host: '/', // when running on localhost
    path: '/api/peerjs',
    // port: '3000' // when running on localhost
    // host: "325a-8-34-69-70.ngrok.io", // when running on peer on server
    port: '443', // when running on peer on server
})

// myPeer.on('open', id => {
    // socket.emit('join-room', "Development", id)
// })

async function devicesavailable() {
    let deviceInfos = await navigator.mediaDevices.enumerateDevices()
    // console.log("devides: "  + deviceInfos)
    for (let i = 0; i < deviceInfos.length; i++) {
        let element = deviceInfos[i];
        if(element.kind === "audioinput"){
            const audioOption = document.createElement("option")
            audioOption.value = element.deviceId
            audioOption.text = element.label
            audioSelect.appendChild(audioOption)
            // console.log(element);
        }
        else if(element.kind === "videoinput"){
            const videoOption = document.createElement("option")
            videoOption.value = element.deviceId
            videoOption.text = element.label
            videoSelect.appendChild(videoOption)
            // console.log(element);
        }
    }
}

let qualityFlagArr = ["qvgaConstraints", "vgaConstraints", "hdConstraints", "fullHdConstraints"]

for (let i = 0; i < qualityFlagArr.length; i++) {
    const option = document.createElement('option')
    option.text = qualityFlagArr[i]
    option.value = qualityFlagArr[i]
    changeQuality.appendChild(option)
}

changeQuality.addEventListener("change", () => {
    console.log(changeQuality.value)
    resolution_ = changeQuality.value
    getStream()
})
async function getStream(){
    console.log(resolution_)
    // Declares
    const qvgaConstraints = {
        width: {exact: 320}, 
        height: {exact: 240},  
        deviceId: {exact: videoSelect.value}
    }

    const vgaConstraints = {
        width: {exact: 640},
        height: {exact: 480}, 
        deviceId: {exact: videoSelect.value}
    }

    const hdConstraints = {
        width: {exact: 1280}, 
        height: {exact: 720},
        deviceId: {exact: videoSelect.value}
    }

    const fullHdConstraints = {
        width: {exact: 3840}, 
        height: {exact: 2160},
        deviceId: {exact: videoSelect.value}
    }

    let qualityFlag = {
        "qvgaConstraints": qvgaConstraints,
        "vgaConstraints": vgaConstraints,
        "hdConstraints": hdConstraints,
        "fullHdConstraints":fullHdConstraints 
    }

    const constraints = {
        audio: {
            deviceId: {exact: audioSelect.value}
        },
        video: qualityFlag[resolution_]
    }
    console.log(`resoltion changed to: ${qualityFlag[resolution_].width.exact}`)


try{
    let stream = await navigator.mediaDevices.getUserMedia(constraints)
    gotStream(stream)
}catch(e){
    console.error("error here: " + e)
}
    // myVideo.srcObject = stream
}

async function gotStream(stream){
    addVideoStream(myVideo, stream)
    socket.emit('join-room', "Development", myPeer.id)

    // this helps the second user to recieve the call
    myPeer.on('call', call => {
        console.log("New call generated")
        call.answer(stream)
        const video = document.createElement('video')
        // This sends our video on second users browser
        call.on('stream', userVideoStream => {
            console.log("User call incoming!")
            addVideoStream(video, userVideoStream, 1)
        })
    })
    socket.on('user-connected', userId => {
        // console.log('User Connected ' + userId)
        connectToNewUser(userId, stream)
    })
    // myVideo.srcObject = stream
    // stream.onremovetrack = (event) => {
    //     console.log(`${event.track.kind} track removed`);
    //   };
    // myVideo.play()
    // videoGrid.appendChild(myVideo)
}

async function stopTrack(){
    if(stopBtn.textContent == "Resume Video"){
        console.log("in resume!")
        let tracks = await stream.getTracks()
        // // console.log(tracks)
        tracks.forEach(track => {
            console.log(`stopping ${track.kind}`)
            track.stop()
        })
        window.stream = stream
    }else{
        let tracks = await stream.getTracks()
        // // console.log(tracks)
        tracks.forEach(track => {
            console.log(`stopping ${track.kind}`)
            track.stop()
        })
        window.stream = stream
        stopBtn.textContent = "Resume Video"
    }
}

async function getForcePermissions(){
    console.log("inside this function")
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    }).then(() => {
        devicesavailable()
    })
}

async function callPeer(){
    console.log(myPeer.id)
    console.log(peers.test)
}


function addVideoStream(video, stream, flag=0) {
    if(flag == 0) {
        window.stream = stream
        myVideo = video
    }
    else if (flag > 0) {
        console.log("adding user stream")
        window.userStream == stream
        video.id = "new-user"
    }
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    stream.onremovetrack = (event) => {
        console.log(`${event.track.kind} track removed`);
    };
    // Adds if video my-video is adding for the first time or 
    // user video is getting added
    if((videoGrid.childNodes.length == 0 && flag == 0) || flag == 1) {
        // console.log(video.id, flag)
        videoGrid.appendChild(video)
        video.id = "my-video"
        console.log("added my video")
    }
    else{
        let video_ = videoGrid.childNodes[0]
        video_.srcObject = stream
        console.log("added user video")
    }
    console.log("Added video now!")
}

async function connectToNewUser(userId, stream) {
    
    const call = await myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        // This adds second users video on our browser
        addVideoStream(video, userVideoStream, 1)
    })
    console.log(await call.metadata)
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
    console.log(peers[userId].peer, " joined us")
}

// // Socket Events
socket.on('user-connected', userId => {
    console.log('User Connected ' + userId)
})

socket.on('user-disconnected', userId => {
    console.log("user disconnected: " + userId)
    if(peers[userId])  peers[userId].close()
})