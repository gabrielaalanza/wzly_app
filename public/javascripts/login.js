$( document ).ready(function() {

	$('.feedback').hide();

    var bg = Math.floor(Math.random() * 9)+1;
    var url = '/images/unsplash/' + bg + '.jpg';
    $('body').css('background-image', 'url(' + url +')');

    $('body').addClass('login');
	
});
