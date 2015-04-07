$( document ).ready(function() {

	//add zero state if all events are out of date
	if($('.events-table tbody').children().length == 0) {
		$('.events-table').remove();
		$('.content h2').after('<p class="emp zero-state">There are no more upcoming events.</p>');
	}

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

	    //populate spam
	    if(event.spam) $('p.spam_view').html('<img src="'+event.spam+'">');

	});

	$('.events-modal').on('hidden.bs.modal', function (e) {
	  	$('.events-form')[0].reset();
	  	$('p.spam_view').text('There is no spam for this event uploaded yet.');
	})

	$('.events-modal').on('shown.bs.modal', function (e) {
		$('input[name="name"]').focus();
	})
	
});
