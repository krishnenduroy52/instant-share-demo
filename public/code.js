(function(){
    let receiverID;
    const socket = io();

    function generateID(){
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;  
    }
    document.getElementById("createroom-btn").addEventListener("click", function(){
        let joinID = generateID();
        document.getElementById("join-id").innerHTML= 
        `
            <b>Room Id</b>
            <span>${joinID}</span>
        `;
        socket.emit("sender-join", {
            uid:joinID
        });
    });

    socket.on("init", function(uid){
        receiverID = uid;
        document.querySelector(".createRoom").classList.remove("active");
        document.querySelector(".fs-screen").classList.add("active");
    });

    document.querySelector("#file-input").addEventListener("change", function(e){
        let file = e.target.files[0];
        if(!file){
            return;
        }
        let reader = new FileReader(); 
        reader.onload = function(e){
            let buffer = new Uint8Array(reader.result);
            let el = document.querySelector(".item");
            el.innerHTML=`
            <div class="progress">0%</div>
            <div class="filename">${file.name}</div>
            `;
            document.querySelector(".files-list").appendChild(el);
            shareFile({
                filename:file.name,
                total_buffer_size:buffer.length,
                buffer_size:1024 * 200;
            },buffer,el.querySelector(".progress"));
        }
        reader.readAsArrayBuffer(file);
    })

    function shareFile(metadata,buffer,progress_node){
        socket.emit("file-meta", {
            uid:receiverID,
            metadata:metadata
        });
        socket.on("fs-share", function(){
            let chunk = buffer.slice(0,metadata.buffer_size)
            buffer = buffer.slice(metadata.buffer_size,buffer.length);
            progress_node.innerHTML = Math.trunc((metadata.total_buffer_size-buffer.length) / metadata.total_buffer_size * 100) + "%";
            if(chunk.length != 0){
                socket.emit("file-raw", {
                    uid:receiverID,
                    buffer:chunk
                });
            }
        });
    }
})();