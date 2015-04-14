$( document ).ready(function() {

	$('.show-form').click(function(){
		$('.add-album-form').show(function() {
			$('input[name="album"]').focus();
		});
	});

	$('.add-album-form button').click(function(event){

		event.preventDefault();

		var album = $('input[name="album"]').val();
		var artist = $('input[name="artist"]').val();

		if(album=="" && artist=="") {
			$('.validation').text('You cannot submit HR without an album and artist.').fadeIn(500);
		} else {
			$.post('/admin/library', { album: album, artist: artist }, function(data) {
				$('.add-album-form').hide(300, function(){
					$('.hr_response').text(data.albumName+' by '+data.albumArtist+' is #'+data.hrID+'.').show();
				});
		    	$('.table-albums > tbody > tr:first').before('<tr><td>'+data.albumName+'</td><td>'+data.albumArtist+'</td><td>'+data.hrID+'</td></tr>');
		    	$('.add-album-form')[0].reset();
			});
		}

	});
	
})