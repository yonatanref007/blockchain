document.addEventListener("DOMContentLoaded", function() {
    let queuedVideosArray = [];
    const savedForm = document.querySelector("#saved-form");
    const queuedForm = document.querySelector("#queued-form");
    const savedDiv = document.querySelector("#saved-div");
    const queuedDiv = document.querySelector("#queued-div");
    const inputDiv = document.querySelector(".input-div");
    const input = document.querySelector(".input-div input");
    const serverMessage = document.querySelector(".server-message");
    
    // Handle file selection
    input.addEventListener("change", function() {
        const files = input.files;
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith("video/")) { // Ensure it's a video
                queuedVideosArray.push(files[i]);
            }
        }
        queuedForm.reset();
        displayQueuedVideos();
    });

    // Handle drag and drop
    inputDiv.addEventListener("drop", function(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith("video/")) { // Ensure it's a video
                if (queuedVideosArray.every(video => video.name !== files[i].name)) {
                    queuedVideosArray.push(files[i]);
                }
            }
        }
        displayQueuedVideos();
    });

    // Function to display queued videos
    function displayQueuedVideos() {
        let videos = "";
        queuedVideosArray.forEach((video, index) => {
            videos += `<div class="video">
                        <video width="200" controls>
                            <source src="${URL.createObjectURL(video)}" type="${video.type}">
                            Your browser does not support the video tag.
                        </video>
                        <button class="delete-button" onclick="deleteQueuedVideos(${index})">&times;</button>
                    </div>`;
        });
        queuedDiv.innerHTML = videos;
    }

    // Function to delete a video from the queue
    window.deleteQueuedVideos = function(index) {
        queuedVideosArray.splice(index, 1);
        displayQueuedVideos();
    };

    queuedForm.addEventListener("submit", function(e){
        e.preventDefault()
        sendQueuedImagesToSever();
    })
    function sendQueuedImagesToSever(){
        const formData = new FormData(queuedForm)
        queuedVideosArray.forEach((video, index)=>{formData.append(`file[${index}]`,video)})
    
        fetch("/videos", {
            method: "POST",
            body : formData
        })
        .then(response => {
            if(response.status !== 200) throw Error(response.statusText)
            location.reload()
        })
        .catch(error =>{
            serverMessage.innerHTML = error
            serverMessage.style.cssText = "backround-color: #f8d7da; color: #b71c1c"
        })
    }
});
