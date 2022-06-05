import './constraints.js'
console.log("in development!")
const videoGrid = document.getElementById('video-grid')
let showBtn = document.getElementById("show-btn")
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");
const changeQuality = document.querySelector("select#changeQuality");
console.log(showBtn)
showBtn.addEventListener("click", getStream)
let stopButton = document.getElementById("stop-btn")
stopButton.addEventListener("click", stopTrack)
const myVideo = document.createElement('video')
myVideo.muted = true
console.log(myVideo.outerHTML)
let resolution_ = "vgaConstraints"
getForcePermissions()
// getStream()
// devicesavailable()
// navigator.mediaDevices.getUserMedia()
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
            console.log(element);
        }
        else if(element.kind === "videoinput"){
            const videoOption = document.createElement("option")
            videoOption.value = element.deviceId
            videoOption.text = element.label
            videoSelect.appendChild(videoOption)
            console.log(element);
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
    window.stream = stream
    myVideo.srcObject = stream
    stream.onremovetrack = (event) => {
        console.log(`${event.track.kind} track removed`);
      };
    myVideo.play()
    videoGrid.appendChild(myVideo)
}

async function stopTrack(){
    let tracks = await stream.getTracks()
    // // console.log(tracks)
    tracks.forEach(track => {
        console.log(`stopping ${track.kind}`)
        track.stop()
    })
    window.stream = stream
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