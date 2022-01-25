
let receiverID;
const socket = io();
function generateID() {
    // return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`;
    let alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
    nanoid = customAlphabet(alphabet, 6);
    return nanoid();
}
document.getElementById("createroom-btn").addEventListener("click", function () {
    let joinID = generateID();
    document.getElementById("join-id").innerHTML =
        `
            <b>Room Id</b>
            <span>${joinID}</span>
        `;
    socket.emit("sender-join", {
        uid: joinID
    });
});

function exit_send() {
    socket.emit("exit-receiver", {
        uid: receiverID
    });
    location.reload();
}

socket.on("init", function (uid) {
    receiverID = uid;
    Swal.fire(
        'Successfully connected',
        'Now share your files with your friends',
        'success'
    );
    document.querySelector(".createRoom").classList.remove("active");
    document.querySelector(".fs-screen").classList.add("active");
});
const dropBox = document.querySelector(".drag-area");
dropBox.addEventListener("drop", (e) => {
    let file = e.dataTransfer.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
        let buffer = new Uint8Array(reader.result);
        let el = document.querySelector(".item");
        el.innerHTML = `
            <div class="progress">0%</div>
            <div class="filename">${file.name}</div>
            `;
        document.querySelector(".files-list").appendChild(el);
        shareFile({
            filename: file.name,
            total_buffer_size: buffer.length,
            buffer_size: 1024 * 200
        }, buffer, el.querySelector(".progress"));
    }
    reader.readAsArrayBuffer(file);
});
document.querySelector("#file-input").addEventListener("change", function (e) {
    let file = e.target.files[0];
    if (!file) {
        return;
    }
    let reader = new FileReader();
    reader.onload = function (e) {
        let buffer = new Uint8Array(reader.result);
        let el = document.querySelector(".item");
        el.innerHTML = `
            <div class="progress">0%</div>
            <div class="filename">${file.name}</div>
            `;
        document.querySelector(".files-list").appendChild(el);
        shareFile({
            filename: file.name,
            total_buffer_size: buffer.length,
            buffer_size: 1024 * 200
        }, buffer, el.querySelector(".progress"));
    }
    reader.readAsArrayBuffer(file);
})

function shareFile(metadata, buffer, progress_node) {
    socket.emit("file-meta", {
        uid: receiverID,
        metadata: metadata
    });
    socket.on("fs-share", function () {
        let chunk = buffer.slice(0, metadata.buffer_size)
        buffer = buffer.slice(metadata.buffer_size, buffer.length);
        progress_node.innerHTML = Math.trunc((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100) + "%";
        if (chunk.length != 0) {
            socket.emit("file-raw", {
                uid: receiverID,
                buffer: chunk
            });
        }
    });
}

socket.on("exit-send", ()=>{
    location.reload();
});

