$( document ).ready(function() {

	var url = window.location.href;
	var page = getQueryVariable("page");
	console.log(page);
	if(url.indexOf('?') == -1 || page == "1") {
		checkForUpdates();
	}

	$('[data-toggle="tooltip"]').tooltip()
	
});

function getQueryVariable(variable) {
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
           var pair = vars[i].split("=");
           if(pair[0] == variable){return pair[1];}
   }
   return "";
}

function checkForUpdates() {
	setInterval(function(){
		$.ajax({
	        url: '/admin/stream',
	        dataType: "JSON",
	        error: function(msg){
	            console.log(msg.statusText);
	        },
	        success: function(json){
	        	$('.table-albums tbody tr').remove();

	            var trHTML = '';
				var now = moment();

				json = json.data;

		        $.each(json, function (i, item) {

		        	var date = moment(item.date);
	            	var display; 

	            	if (now.diff(date, 'days') === 0) {
		                display = moment(item.date).format('h:mm a')
		            } else if (now.diff(date, 'days') === 1) {
	                	display = moment(date).calendar()
	               	} else {
	                	display = moment(item.date).format('MMM Do') + " at " + moment(item.date).format('h:mm a')
	                }

	                var name = item.name;
					if (name == "" || name == undefined) name = "<emp>No title</emp>";
					var artist = item.artist;
					if (artist== "" || artist == undefined) artist = "";
					var album = item.album;
					if (album == "" || album == undefined) album = "";

		            trHTML += '<tr><td><span data-toggle="tooltip" data-placement="top" title="Played by: '+item.playedBy+'">' + name + '</span></td><td>' + artist + '</td><td>' + album + '</td><td>' + display + '</td></tr>';
		        	console.log(trHTML);
		        });

		        $('.table-albums').append(trHTML);
		        $('[data-toggle="tooltip"]').tooltip();
	        }
	    });
	}, 10000);
}