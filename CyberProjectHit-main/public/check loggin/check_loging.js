document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

function checkLoginStatus() {
    fetch('/check-login', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.loggedIn) {
            window.location.href = 'error.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = 'error.html';
    });
}

app.get('/check-login', (req, res) => {
    if (req.session.loggedIn) {
        res.json({ loggedIn: true, username: req.session.username });
    } else {
        res.json({ loggedIn: false });
    }
});