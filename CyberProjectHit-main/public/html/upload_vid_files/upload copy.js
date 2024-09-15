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
        for (const element of files) {
            if (element.type.startsWith("video/")) { // Ensure it's a video
                queuedVideosArray.push(element);
            }
        }
        queuedForm.reset();
    });


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
