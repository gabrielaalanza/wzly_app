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

	    //time handling
	    /*
	    var startTime = (event.start_time).split(" ");
	    var startAMPM = startTime[1];
	    var startHour = startTime[0].split(":");
	    var startMinute = startHour[1];
	    startHour = startHour[0];

	    $('[name="start_hour"]').val(event.startHour);
	    $('[name="start_minute"]').val(event.startMinute);
	    $('[name="start_ampm"]').val(event.startAMPM);

	    var endTime = (event.end_time).split(" ");
	    var endAMPM = endTime[1];
	    var endHour = endTime[0].split(":");
	    var endMinute = endHour[1];
	    endHour = endHour[0];

	    $('[name="end_hour"]').val(event.endHour);
	    $('[name="end_minute"]').val(event.endMinute);
	    $('[name="end_ampm"]').val(event.endAMPM);
	    */

	});
	
});
