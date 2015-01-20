$( document ).ready(function() {

	//check to see if event should be updated or deleted
	$(".edit-event").click(function() {

		//get id of event and look it up in stored events array
	    var id = $(this).attr('data-id');
	    var event = local_data[id];

	    var date = new Date(event.start_time);
	    date = moment(date);

	    $('[name="date"]').val(date.format('YYYY-MM-DD'));

	    $('[name="start_hour"]').val(date.format('h'));
	    $('[name="start_minute"]').val(date.format('mm'));
	    $('[name="start_ampm"]').val(date.format('A'));

	    var end_date = new Date(event.end_time);
	    end_date = moment(end_date);
	    console.log(event.end_time);

	    $('[name="end_hour"]').val(end_date.format('h'));
	    $('[name="end_minute"]').val(end_date.format('mm'));
	    $('[name="end_ampm"]').val(end_date.format('A'));


	    //populate fields with information
	    $('[name="name"]').val(event.name);
	    $('[name="description"]').val(event.description);
	    $('[name="location"]').val(event.location);

	    //populate hidden field
	    $('[name="id"]').val(event._id);

	    /*date handling
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
