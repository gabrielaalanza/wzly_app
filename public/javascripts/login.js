$( document ).ready(function() {

	$('.feedback').hide();

    var bg = Math.floor(Math.random() * 18)+1;
    var url = '/images/unsplash/' + bg + '.jpg';
    $('body').css('background-image', 'url(' + url +')');

    $('body').addClass('login');
    
    $(".form-signin button[type='submit']").click(function() {

		event.preventDefault();

		var username = $('input[name="username"]').val();
		var password = $('input[name="password"]').val();

	    $.post('/login', { username: username, password: password}, function(data) {
	    	$('.form-signin')[0].reset();
	    	if(typeof data.redirect == 'string') {
	    		window.location = data.redirect;
	    	} else {
	    		$('.loginerror').text(data);
	    	}
		});  

	});
	
});
