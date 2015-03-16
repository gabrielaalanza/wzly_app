$( document ).ready(function() {

    if(user.live) {
        $('.pulse').show();
    }

	//change table to reflect desired charts
	$("select").change(function() {


		var startIndex;
		var endIndex;
		var playlist;

		var date = $("select option:selected").text();

		if(date=="Choose date"){
			$('.zero-state').removeClass('hide');
			$('.table-playlists').addClass('hide');
		} else {

			var now = moment();
			var dateArr = date.split(" ");
			var day =  dateArr[1].substring(0, dateArr[1].length - 2);
			var selectedDate = moment().year(dateArr[2]).month(dateArr[0]).date(day);

			for (var i = user.playlists.length - 1; i >= 0; i--) {
				var d = new Date(user.playlists[i].date);
				d = moment(d);
				if(selectedDate.isSame(d,'day')){
					startIndex = user.playlists[i].startIndex;
					endIndex = user.playlists[i].endIndex;
					console.log(startIndex);
					console.log(endIndex);
					break;
				}
			};

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
