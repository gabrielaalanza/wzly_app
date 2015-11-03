$( document ).ready(function() {

    var bg = Math.floor(Math.random() * 18)+1;
    var url = '/images/unsplash/' + bg + '.jpg';
    $('body').css('background-image', 'url(' + url +')');

    $('body').addClass('login');

    $(".form-signin button[type='submit']").click(function() {

		event.preventDefault();

		var username = $('input[name="username"]').val();

	    $.post('/forgot-password', { username: username}, function(data) {
	    	$('.form-signin')[0].reset();
	    	console.log(data);
	    	if(data) {
	    		$('.loginerror').text(data);
	    	} else {
	    		$('.loginerror').text('You got it, dude. We have sent a reset link to your email.');
	    	}
		});  

	});
	
});
