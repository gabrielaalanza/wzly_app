$( document ).ready(function() {

    if(user.live) {
        $('.pulse').show();
    }

	//change table to reflect desired charts
	$("select").change(function() {

		$('.playlist-name').addClass('hide');
		$('.playlist-description').addClass('hide');

		var startIndex = $("select option:selected").attr("data-start");
		var endIndex = $("select option:selected").attr("data-end");
		var playlist, name, description;

		var date = $("select option:selected").text();

		if(date=="Choose date"){
			$('.zero-state').removeClass('hide');
			$('.table-playlists').addClass('hide');
		} else {

			$('.table-playlists tbody tr').remove();
			
			var n = endIndex - startIndex + 1;
			for (var i = endIndex - 1; i >= startIndex-1; i--) {
				$('.table-playlists tbody').prepend('<tr><td>'+n+'.'
																+'</td><td>'+songs[i].name
																+'</td><td>'+songs[i].artist
																+'</td><td>'+songs[i].album
																+'</td>+</tr>');
				n--;
			};
		
			$('.zero-state').addClass('hide');
			$('.table-playlists').removeClass('hide');

			var icon = '<a href="#" data-target=".playlist-modal", data-toggle="modal"><img src="/images/icons/edit.png" class="icon"></a>';

			for (var i = user.playlists.length - 1; i >= 0; i--) {
				if(startIndex == user.playlists[i].startIndex) {
					if(user.playlists[i].name) $('.playlist-name').text(user.playlists[i].name).append(icon).removeClass('hide');
					if(user.playlists[i].description) $('.playlist-description').text(user.playlists[i].description).removeClass('hide');
				}
			};

		}

	});
	
});
