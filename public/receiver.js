(function(){
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
        socket.emit("reveiver-join", {
            uid:joinID,
            sender_uid:senderID
        });

        document.querySelector(".createRoom").classList.remove("active");
        document.querySelector(".fs-screen").classList.add("active");

    })
});