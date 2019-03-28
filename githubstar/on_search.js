const _buildin_keywords = ['new', 'organizations', 'settings', 'articles', 'topics', 'site', 'search'];

function get_url(item) {
	var arr = item.split('/');
	return ["https://api.github.com/repos", arr[1], arr[2]].join('/');
}

function get_inline_html(data) {
	return '<span style="font-size:12px" ><span style="margin: 0 2px 0 8px" ><svg class="octicon octicon-star v-align-text-bottom" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"></path></svg></span>' +
	data.watchers_count +
	'<span style="margin: 0 2px 0 4px" ><svg class="octicon octicon-repo-forked v-align-text-bottom" style="margin: 0 2px 0 2px" viewBox="0 0 10 16" version="1.1" width="10" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path></svg></span>' +
	data.forks_count +
	'</span>'
}

chrome.storage.local.get('github_auth', function (storage) {
	if (!!storage.github_auth) {
		$.ajaxSetup({
			headers: {
				'Authorization': 'token ' + storage.github_auth.token
			}
		});
	}
});

$(document).ajaxComplete(function (e, xhr, options) {
	var remaining = xhr.getResponseHeader('X-RateLimit-Remaining');
	if (remaining !== null) {
		var limit = xhr.getResponseHeader('X-RateLimit-Limit');
		log('API calls remained: ' + remaining + '/' + limit);
	}
});


function DoJob() {
	$('.codesearch-results a').each(function() {
		var ahref = $(this).prop('href');
		//console.log(ahref);
		var r = /(github\.com\/)([\w_\-\.]+)\/([\w_\-\.]+)$/i;
		if (r.test(ahref)) {
			var url = ahref.match(r);
			if (url) {
				var item = url[0];	
				var arr = item.split('/');
				if (!_buildin_keywords.includes(arr[1])) {
					var data = lscache.get(item);
					var elem = $(this);
					if (data) {
						elem.after(get_inline_html(data));
					} else {
						$.getJSON(get_url(item), function(data) {
							lscache.set(item, data, 60);
							elem.after(get_inline_html(data));
						});
					}
				}
			}
		}
	});
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.action == 'DoJob') {
		DoJob();
	}
});