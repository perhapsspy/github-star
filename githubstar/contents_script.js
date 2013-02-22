function log(str) {console.log(str);}
function get_url(item) {
	var arr = item.split('/');
	return ["https://api.github.com/repos", arr[1], arr[2]].join('/');
}
function get_html(data) {
	return data.full_name + "<br />watchers [ " + data.watchers_count + " ] forks [ " + data.forks_count+" ]"
}

var r = /(github\.com\/)([\w_\-\.]+)\/([\w_\-\.]+)/gmi;
var loader = $('<div id="github-star-loader">Github Star</div>').css( {
	display : "none",
	position : "absolute",
	border:"1px solid #ccc",
	borderRadius:"5px 5px",
	background:"#fff",
	color:"#333",
	padding:"5px",
	top: "5px",
	left: "5px",
	zIndex : "99"
}).appendTo("body");

$('body a').each(function() {
	var href = $(this).attr('href');
	if (r.test(href)) {
		var url = href.match(r);
		if (url) {
			var item = url[0];	
			$(this).hover(function(e) {
				loader.css({
					top : (e.pageY + 5) + "px",
					left : (e.pageX + 15) + "px"
				});
				loader.show();
				var data = lscache.get(item)
				if (data) {
					loader.html(get_html(data));
				} else {
					$.getJSON(get_url(item), function(data) {
						lscache.set(item, data, 60);
						loader.html(get_html(data));
					});
				}
			}, function() {
				loader.hide();
				loader.text('Loading. If you wait too long, Can not be found(404) or has been limited(60/hour)');
			});
		}
	}
});