$( document ).ready(function() {

	//check to see if event should be updated or deleted
	$(".pic-box").click(function(event){

		$('.pic-box').removeClass('active-eboarder');

		//get position of clicked box
		var position=$(event.target).data("position");

		//set title
		$('.position-title').text(position);

		//highlight row
		$(event.target).addClass('active-eboarder');

		//populate hidden field
	    $('[name="position"]').val(position);

	    var check = true;

	    for (var i = local_data.length - 1; i >= 0; i--) {
	    	if(local_data[i].position == position) {
	    		var eboarder = local_data[i];
	    		//populate fields with information
			    $('[name="name"]').val(eboarder.name);
			    $('[name="year"]').val(eboarder.year);
			    $('[name="show"]').val(eboarder.show);
			    $('[name="time"]').val(eboarder.time);
			    $('[name="animal"]').val(eboarder.animal);
			    $('[name="bands"]').val(eboarder.bands);
			    $('[name="concert"]').val(eboarder.concert);
			    $('[name="thoughts"]').val(eboarder.thoughts);
			    $('[name="interview"]').val(eboarder.interview);

			    check = false;
			    break;
	    	}
	    };

	    //set all the fields back to null
	    if(check) {
	    	$('[name="name"]').val('');
			    $('[name="year"]').val('');
			    $('[name="show"]').val('');
			    $('[name="time"]').val('');
			    $('[name="animal"]').val('');
			    $('[name="bands"]').val('');
			    $('[name="concert"]').val('');
			    $('[name="thoughts"]').val('');
			    $('[name="interview"]').val('');
	    }

			
	});
	
});

