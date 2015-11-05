$( document ).ready(function() {

	//add zero state if all events are out of date
	if($('.events-table tbody').children().length == 0 && local_data.length > 0) {
		$('.events-table').remove();
		$('.content h2').after('<p class="emp zero-state">There are no more upcoming events.</p>');
	}

	//check to see if event should be updated or deleted
	$(".edit-event").click(function() {

		//get id of event and look it up in stored events array
	    var id = $(this).attr('data-id');
	    var event = local_data[id];

	    var date = moment(event.start_time);

	    $('[name="date"]').val(date.format('YYYY-MM-DD'));

	    $('[name="start_hour"]').val(date.format('h'));
	    $('[name="start_minute"]').val(date.format('mm'));
	    $('[name="start_ampm"]').val(date.format('A'));

	    var end_date = moment(event.end_time);

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
	    if(event.spam) $('p.spam_view').html('<img src="'+event.spam+'">').show();

	});

	$('.events-modal').on('hidden.bs.modal', function (e) {
	  	$('.events-form')[0].reset();
	  	$('p.spam_view').hide();
	})

	$('.events-modal').on('shown.bs.modal', function (e) {
		$('input[name="name"]').focus();
	})
	
 var input_element = $('.spam-input');
    $(input_element).change(function() {
        s3_upload();
    });
});

function s3_upload(){
    var status_elem = $('.status');
    var url_elem = $('#avatar_url');
    var id = $('[name="id"]').val();
    var s3upload = new S3Upload({
        file_dom_selector: 'files',
        s3_sign_put_url: '/admin/sign_s3',
        event_id: id,
        onProgress: function(percent, message) {
            console.log('uploading')
            $('.status').html('Upload progress: ' + percent + '% ' + message);
        },
        onFinishS3Put: function(public_url) {
            console.log('finished uploading');
            $('.status').html('Upload completed. Please save your changes.');
            $('#spam_url').val(public_url);
        },
        onError: function(status) {
            console.log('error');
            $('.status').html('Upload error: ' + status);
        }
    });
}