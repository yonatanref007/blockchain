document.addEventListener("DOMContentLoaded", function() {
  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.querySelector('input[type="file"]');
  const titleInput = document.getElementById('e1');
  const descriptionInput = document.getElementById('e2');
  const checkboxes = document.querySelectorAll('.custom-control-input');

  uploadForm.addEventListener('submit', function(event) {
      event.preventDefault();

      // Validate form fields
      if (!fileInput.files.length) {
          alert('Please select a video file.');
          return;
      }
      if (!titleInput.value.trim()) {
          alert('Please enter a title for the video.');
          return;
      }
      if (!descriptionInput.value.trim()) {
          alert('Please provide a description.');
          return;
      }

      // Collect selected categories
      let selectedCategories = [];
      checkboxes.forEach(function(checkbox) {
          if (checkbox.checked) {
              selectedCategories.push(checkbox.labels[0].innerText);
          }
      });

      if (selectedCategories.length === 0) {
          alert('Please select at least one category.');
          return;
      } else if (selectedCategories.length > 6) {
          alert('You can select up to 6 categories only.');
          return;
      }

      // Create FormData object to send the file and data
      let formData = new FormData();
      formData.append('video', fileInput.files[0]);
      formData.append('title', titleInput.value.trim());
      formData.append('about', descriptionInput.value.trim());
      formData.append('categories', JSON.stringify(selectedCategories));

      // Send POST request to the server
      fetch("/videos", {
          method: 'POST',
          body: formData
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Failed to upload video. Please try again.');
          }
              // Check if the content type is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json(); // Parse JSON if it is a valid JSON response
    } else {
        throw new Error('Server did not return JSON.');
    }
      })
      .then(data => {
          alert('Video uploaded successfully!');
          // Perform additional actions like redirecting, etc.
          // Example: window.location.href = '/uploaded-videos';
      })
      .catch(error => {
          console.error('Error:', error);
          alert('An error occurred during the upload: ' + error.message);
      });
  });
});