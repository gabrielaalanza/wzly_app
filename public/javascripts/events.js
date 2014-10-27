$( document ).ready(function() {

	//check to see if event should be updated or deleted
	$(".edit-event").click(function() {

		//get id of event and look it up in stored events array
	    var id = $(this).attr('data-id');
	    var event = local_data[id];

	    //populate fields with information
	    $('[name="name"]').val(event.name);
	    $('[name="description"]').val(event.description);
	    $('[name="location"]').val(event.location);

	    //populate hidden field
	    $('[name="id"]').val(event._id);

	    //date handling
	    var myDate, day, month, year, date;
		myDate = new Date(event.date);
		day = myDate.getDate();
		if (day <10)
		  day = "0" + day;
		month = myDate.getMonth() + 1;
		if (month < 10)
		  month = "0" + month;
		year = myDate.getFullYear();
		date = year + "-" + month + "-" + day;
	    $('[name="date"]').val(date);

	});
	
});
