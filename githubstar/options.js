(function($) {

GITHUB_APP_CLIENT_ID = 'c9b78ecab5adc7295774';
GITHUB_APP_CLIENT_SECRET = '8ced5c5d4650df2c00bc7e881d85aa9028149703';
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

chrome.storage.local.get('github_auth', function (storage) {
	if (!!storage.github_auth) {
		signinForm.style.display = 'none';
		updateInfo(storage.github_auth);
	} else {
		info.style.display = 'none';
	}
});

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
			chrome.storage.local.set({'github_auth': data}, function () {
				signinForm.style.display = 'none';
				info.style.display = 'block';
				updateInfo(data);
			});
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

function updateInfo(auth) {
	var token = auth.token;
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
			chrome.storage.local.remove('github_auth', function () {
				info.style.display = 'none';
				signinForm.style.display = 'block';
			});
		}
	});
	req.setRequestHeader('Authorization', 'token ' + token);
	req.send(null);
}

}(jQuery));
