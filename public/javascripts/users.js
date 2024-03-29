$( document ).ready(function() {

	var users = local_data;

	$('.show-form').click(function(){
		$('.user-form').show(function() {
			$('input[name="dj-name"]').focus();
		});
	});

	$('input:checkbox').click( function(){
        if (!$(this).is(':checked')) {
            $('input[name="dj-email"]').animate({width:'toggle'},350);
        } else {
            $('input[name="dj-email"]').animate({width:'toggle'},350);
        }
    });

	$('.remove-position').click(function() {
		var id = $(this).closest('tr').data('id');

	    $.post('/admin/remove-position/'+id, function(data) {
	    	location.reload();
		});  
	});

	$('.hide-user').click(function() {
		var id = $(this).closest('tr').data('id');

	    $.post('/admin/hide-user/'+id, function(data) {
	    	location.reload();
		});  
	});

	$('.show-user').click(function() {
		var id = $(this).closest('tr').data('id');

	    $.post('/admin/show-user/'+id, function(data) {
	    	location.reload();
		});  
	});

	$('.delete-user').click(function() {
		var id = $(this).closest('tr').data('id');

	    $.post('/admin/user/'+id, function(data) {
	    	location.reload();
		});  
	});

	$('.position-save').click(function(){
		var position = $('input[name="position-name"]').val();
		var id = $('input[name="position-name"]').data('id');

	    $.post('/admin/add-position/'+id, { position: position }, function(data) {
	    	location.reload();
		});  

		$('.position-modal').modal('hide');
	});

	$('.position-modal').on('show.bs.modal', function (event) {
	  	var button = $(event.relatedTarget); // Button that triggered the modal
	  	var name = button.data('name'); // Extract info from data-* attributes
	  	var id = button.closest('tr').data('id');
	  	var modal = $(this);
	  	modal.find('.name').text(name);
	  	modal.find('.position-name').attr('data-id',id);
	});

	$('.position-modal').on('shown.bs.modal', function (event) {
	    $('.position-name').focus();
	});

	$('.user-form button').click(function(event){

		event.preventDefault();

		var name = $('input[name="dj-name"]').val();
		var username = $('input[name="username"]').val();
		var position = $('input[name="position"]').val();
		var email = $('input[name="dj-email"]').val();

		//check to see if submitted username is already a user
		var regDJ = false;
		for (var i = users.length - 1; i >= 0; i--) {
			if(username == users[i].local.username) regDJ = true;
		};

		if(regDJ) {
			//give error message
			$('.error').text("User is already in the system.").fadeIn();
			setTimeout(function(){
				$('.error').fadeOut();
				$('input[name="username"]').css('border-color','rgba(243,235,232,1)');
				$('.user-form')[0].reset();
			}, 4000);

		} else if (username=="") {

			$('input[name="username"]').css('border-color','#EB7A71');
			$('.error').text("You must enter a username.").fadeIn();

		} else if (name=="") {

			$('input[name="name"]').css('border-color','#EB7A71');
			$('.error').text("You must enter a name.").fadeIn();

		} else {

		    $.post('/admin/users', { name: name, username: username, position : position, email: email }, function(data) {
		    	$('.user-form')[0].reset();
		    	$.ajax({
			        url: '/admin/users',
			        dataType: "JSON",
			        error: function(msg){
			            console.log(msg.statusText);
			        },
			        success: function(json){
			        	$('.table-users tbody tr').remove();

			            var trHTML = '';

						json = json.data;

				        $.each(json, function (i, item) {

				            trHTML += '<tr data-id="'+item._id+'"><td>'+(i+1)+'.</td><td>' 
				            			+ item.local.name + '</td><td>' 
				            			+ item.local.username + '</td>';
				            if(item.eboard) {
				            	trHTML += '<td>'+item.eboard.position + '</td>'
				            } else {
				            	trHTML += '<td></td>'
				            }

				            if (item.permanent != true) {
				            	trHTML += '<td><div class="dropdown"><button class="btn dropdown-toggle clear" type="button" id="actions" data-toggle="dropdown" aria-expanded="false"><img src="/images/icons/gear.png" class="icon"><span class="caret"></button>'
				            	           +'<ul class="dropdown-menu" role="menu" aria-labelledby="actions">';
	                     		if (item.eboard) {
		                        	trHTML += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="remove-position"><img src="/images/icons/minus.png" class="icon"> Remove Position</a></li>';
		                        } else {
		                        	trHTML += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="add-position" data-toggle="modal" data-target=".position-modal" data-name="'+item.local.name+'"><img src="/images/icons/plus.png" class="icon"> Add a Position</a></li>';
		                        }
		                        trHTML += '<li role="presentation"><form method="post" action="/admin/user/'+item._id+'"><button class="clear" role="menuitem" tabindex="-1" type="submit"><img src="/images/icons/trash.png") class="icon"> Delete user</button></form></li></ul></div></td>';
				            } else {
				            	trHTML += '<td></td>'
				            }

				            trHTML += '</tr>'
				        });

				        $('.table-users').append(trHTML);

					    $('.dropdown-toggle').dropdown();

					    if(!$('input:checkbox').is(':checked')) {
				            $('input[name="dj-email"]').animate({width:'toggle'},350);
				            $('input:checkbox').prop('checked', true);
				        }

						$('input[name="dj-name"]').focus();

		                $('.user-message').fadeIn().delay(1500).fadeOut();
						
			        }
			    });
				
			});  
		}
	});
	
});
