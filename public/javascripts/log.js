$(function() {

    if(user.live) {
        $('.pulse').show();
    }

	var current_playlist = user.playlists[user.playlists.length-1];

	if(current_playlist.name) $(".playlist-form input[name='name']").val(current_playlist.name);
	if(current_playlist.description) $(".playlist-form textarea[name='description']").val(current_playlist.description);

	$('.go-live').submit(function() {
		$('this').find('button').prop("disabled",true);
	})

	$( ".playlist-form" ).submit(function( event ) {
	  event.preventDefault();
	  saveDescription(event);
	});

})

function saveDescription(event) {

	if(event.handled !== true) {

		var name = $(".playlist-form input[name='name']").val();
		var description = $(".playlist-form textarea[name='description']").val();

	    $.post('/app/description',{'description': description, 'name': name, 'user': user}, function() {
	    	console.log("done");
		});

	    event.handled = true;

	    $('.playlist-modal').modal('hide')
  	}
  return false;
}

function validate() {
	var song = $('.song').val();
	var artist = $('.artist').val();
	if(song=="" && artist=="") {
		$('.validation').text('You cannot submit a song without a title and artist.').fadeIn(500);
		return false;
	} else {
		return true;
	}
}