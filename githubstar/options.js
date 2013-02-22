(function(localStorage) {

GITHUB_APP_CLIENT_ID = '0698771622b6d6a0febc';
GITHUB_APP_CLIENT_SECRET = '5f7a7d9700a4e8282c161cd7f33d9051fa1a3dc5';
GITHUB_API_URL = 'https://api.github.com/';


function makeRequest(method, url) {
    var req = new XMLHttpRequest();
    req.addEventListener('load', function (e) {
        var remainingLimit = this.getResponseHeader('X-RateLimit-Remaining');
        if (remainingLimit !== null) {
            console.log('' + remainingLimit + ' API calls remained');
        }
    });
    req.addEventListener('error', function (e) {
        console.log('Network error');
    });
    if (!url.match(/^https?:\/\//)) {
        url = GITHUB_API_URL + url;
    }
    req.open(method, url, true);
    req.setRequestHeader('Accept', 'application/json');
    return req;
}

function makeBaseAuth(username, password) {
    var token = username + ':' + password;
    var hash = Base64.encode(token);
    return 'Basic ' + hash;
}


var signinForm = document.querySelector('#github-signin'),
    info = document.querySelector('#github-info');

if (localStorage.getItem('github_auth') !== null) {
    signinForm.style.display = 'none';
    updateInfo();
} else {
    info.style.display = 'none';
}

signinForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var username = this.querySelector('#github-username').value;
    var password = this.querySelector('#github-password').value;
    var submitButton = this.querySelector("button[type='submit']");

    var req = makeRequest('post', 'authorizations');
    req.addEventListener('load', function (e) {
        var data;
        if (this.status == 201) {
            data = JSON.parse(this.responseText);
            localStorage.setItem('github_auth', JSON.stringify(data));
            signinForm.style.display = 'none';
            info.style.display = 'block';
            updateInfo();
        } else if (400 <= this.status && this.status < 500) {
            console.log(this.status);
            data = JSON.parse(this.responseText);
            console.log(data.message);
        }
    });
    req.addEventListener('loadend', function (e) {
        $(submitButton).button('reset');
    });
    req.setRequestHeader('Authorization', makeBaseAuth(username, password));
    var formData = JSON.stringify({
        client_id: GITHUB_APP_CLIENT_ID,
        client_secret: GITHUB_APP_CLIENT_SECRET
    });
    req.send(formData);
    $(submitButton).button('loading');
});

function updateInfo() {
    var token = JSON.parse(localStorage.getItem('github_auth')).token;
    var req = makeRequest('get', 'user');
    req.addEventListener('load', function (e) {
        if (this.status < 400) {
            var data = JSON.parse(this.responseText);
            console.log(data);
            var avatar = info.querySelector('.avatar'),
                heading = info.querySelector('h3 a');
            avatar.href = heading.href = data.html_url;
            avatar.querySelector('img').src = data.avatar_url;
            heading.innerHTML = data.name;
        } else {
            console.log(this.status);
            localStorage.removeItem('github_auth');
            info.style.display = 'none';
            signinForm.style.display = 'block';
        }
    });
    req.setRequestHeader('Authorization', 'token ' + token);
    req.send(null);
}

document.querySelector('#revoke-auth').addEventListener('click', function (e) {
    var auth = JSON.parse(localStorage.getItem('github_auth'));
    var req = makeRequest('delete', auth.url);
    req.addEventListener('load', function (e) {
        console.log(this.status);
        localStorage.removeItem('github_auth');
        info.style.display = 'none';
        signinForm.style.display = 'block';
    });
    req.setRequestHeader('Authorization', 'token ' + auth.token);
    req.send(null);
});

}(window.localStorage));
