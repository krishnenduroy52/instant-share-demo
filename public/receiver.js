let senderID;
        
const socket = io();

function generateID(){
    return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;  
}
document.getElementById("receive-btn").addEventListener("click", function(){

    senderID = document.querySelector("#join-id").value;

    if(senderID.length == 0){
        return;
    }     
    let joinID = generateID();
    socket.emit("receiver-id-check", senderID)
    socket.emit("reveiver-join", {
        uid:joinID,
        sender_uid:senderID
    });
    // if(invalidEl != 1){
        let create_room = document.querySelector(".createRoom");
        let fs_screen =  document.querySelector(".fs-screen");
    // } 
    socket.on("invalid", (data) => {
        if(data == 1){
            Swal.fire(
                'Oops! Invalid Id',
                'Please check the Room ID again',
                'error'
            )
        }                
        else{
            Swal.fire(
                'Successfully connected',
                'Now share your files with your friends',
                'success'
            )
            create_room.classList.remove("active");
            fs_screen.classList.add("active"); 
        }
    });     
});

function exit_send(){
    socket.emit("exit-sender", {
        uid: senderID
    });
    location.reload();
}

let fileShare = {};
socket.on("fs-meta", function(metadata){
    fileShare.metadata = metadata;
    fileShare.transmitted = 0;
    fileShare.buffer = [];
    let el = document.querySelector(".item");
    el.innerHTML=`
    <div class="progress">0%</div>
    <div class="filename">${metadata.filename}</div>
    `;
    document.querySelector(".files-list").appendChild(el)

    fileShare.progress_node = el.querySelector(".progress");

    socket.emit("fs-start", {
        uid:senderID
    });
});

socket.on("fs-share", function(buffer){
    fileShare.buffer.push(buffer);
    fileShare.transmitted += buffer.byteLength;
    fileShare.progress_node.innerHTML = Math.trunc(fileShare.transmitted / fileShare.metadata.total_buffer_size * 100) + "%";
    if(fileShare.transmitted == fileShare.metadata.total_buffer_size){
        download(new Blob(fileShare.buffer), fileShare.metadata.filename);
        fileShare = {};
    }else{
        socket.emit("fs-start", {
            uid:senderID
        });
    }
});

socket.on("exit-rev", ()=>{
    location.reload();
});
