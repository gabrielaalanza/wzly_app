$( document ).ready(function() {

    var bg = Math.floor(Math.random() * 18)+1;
    var url = '/images/unsplash/' + bg + '.jpg';
    $('body').css('background-image', 'url(' + url +')');

    $('body').addClass('login');


    $(".form-signin button[type='submit']").click(function() {

		event.preventDefault();

		var password = $('input[name="password"]').val();

		var url = window.location.href;
		var url_array = url.split("/reset/");
		var token = url_array[1];

		var postTo = '/reset/'+token;

	    $.post(postTo, { password: password}, function(data) {
	    	if(data) {
	    		$('.loginerror').text(data);
	    	} 
		});  

	});
	
});
