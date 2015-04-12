$( document ).ready(function() {

    if(user.live) {
        $('.pulse').show();
    }

	//change table to reflect desired charts
	$("select").change(function() {


		var startIndex = $("select option:selected").attr("data-start");
		var endIndex = $("select option:selected").attr("data-end");
		var playlist;

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

		}

	});
	
});
