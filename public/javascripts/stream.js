$( document ).ready(function() {

	var url = window.location.href;
	if(url.indexOf('?') == -1) {
		checkForUpdates();
	}
	
});

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

		            trHTML += '<tr><td>' + item.name + '</td><td>' + item.artist + '</td><td>' + item.album + '</td><td>' + display + '</td></tr>';
		        
		        });

		        $('.table-albums').append(trHTML);
	        }
	    });
	}, 10000);
}