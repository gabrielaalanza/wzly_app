$( document ).ready(function() {

	activeNav();

	//check to see if event should be updated or deleted
	$(".contact-form button[type='submit']").click(function() {

		event.preventDefault();

    	$('.contact-modal').modal('hide');

		var name = $('input[name="name"]').val();
		var email = $('input[name="email"]').val();
		var message = $('textarea[name="message"]').val();

	    $.post('/contact', { name: name, email: email, message: message }, function(data) {
	    	$('.contact-form')[0].reset();
	    	if(data) {
	    		$('body').prepend('<div class="alert alert-dismissable" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Your message could not be sent. Please try again later.</div>');
	    	} else {
	    		$('body').prepend('<div class="alert alert-dismissable" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Thanks! We will get to your message as soon as possible.</div>');
	    	}
	    	setTimeout(function() {
	    		$('.alert').alert('close');
	    	}, 4000)
		});  

	});
	
});

function activeNav() {

	var links = $('.left-nav ul li');
	var url = parseURL(document.URL);
	var path = url.path;

	$.each(links, function() {
		var linkUrl = $(this).find('a').attr('href');
    	if(linkUrl == path) {
    		$(this).addClass('active');
    		var img = $(this).find('img').attr('src').split('.');
    		$(this).find('img').attr('src',img[0]+'-active.'+img[1]);
    	}
	});
}

function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
}