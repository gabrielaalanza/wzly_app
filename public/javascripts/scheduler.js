$(function() {
	
	// Initialize some jQuery objects
	var 
		$error = $('.error'),
		$info = $('.info'),
		$entry_username = $('.entry-username'),
		$schedule = $('.schedule'),
		$clone = $('#clone'),
		$generate = $('#generate');
	
	djSchedule = djSchedule[0];

	if(typeof(djSchedule) === 'undefined') {
		//djSchedule = createArray(7,24);
		djSchedule = createSchedule();
	} else {
		djSchedule = djSchedule.schedule;
		//put the DJs into their correct slots
		renderSchedule();
		//create a list of current DJs and their slots to check deletes against
		//var originalDJs = originalDJs();
	}
	
	var djUpdates = [];

	//see if items are being selected

	// Start the setup
	init();
	
	// Setup code
	function init() {
		// Hide Stuff
		$error.hide();
		$info.hide();
		
		// Activate buttons
		$entry_username.change(addEntryMode);
		$('.add-entry-form').submit(addEntries);
		$('.remove-entries')
			.click(removeEntries)
			.hover(removeEntriesHighlight, removeEntriesUndoHighlight);
		
		// Whenever entries are created, let them be deletable
		$('.deletable').live('click',removeEntry);

		// Delete highlighted rows on cancel
		$('.cancel').click(endAddMode);
		
		// Prevent text selection on double-click
		$('.actions a')
			.attr('unselectable','on')
			.css('MozUserSelect','none')
			.bind('selectstart.ui', function() {
				return false;
			});

		//submit information and return to rest of interface
		$('.publish').click(publish);

		//highlight td and th on hover
		$("td").mouseover(function(){
			$(this).closest('table').find('th').eq($(this).index()).addClass("current");
			$(this).parent('tr').find('th:first').addClass("current");
		}).mouseout(function(){
			$(this).closest('table').find('th').eq($(this).index()).removeClass("current");
			$(this).parent('tr').find('th:first').removeClass("current");
		});

		//show hidden rows
		$('.show-rows').click(showHiddenRows);

		//add a host
		$('.add-host').click(addCoHost);
	}
	
	// Show "add entry" section
	function addEntryMode() {

		// Prevent entry deletion when section is open
		$schedule.find('.entry').removeClass('deletable').removeAttr('title');
		
		// Make the table cells selectable
		var options = {filter: 'td', stop: function (event, ui) {
				var colIndex = $schedule.find('.ui-selected').index();
			    var column = $('.schedule tr td:nth-child('+colIndex+')');
			    $('.schedule td').not('td:nth-child('+colIndex+')').selectable( "disable" );
			    $schedule.selectable('destroy').selectable(options);
		    }
		}
		$schedule.selectable(options);

		//make sure that only a single column can be selected
		$(".schedule td").mousedown(function (e) {
		    var colIndex = $(this).index() + 1;
		    var column = $('.schedule tr td:nth-child('+colIndex+')');
		    $('.schedule td').not('td:nth-child('+colIndex+')').removeClass('ui-selected');
		    $schedule.selectable( "option", "filter", column );
		});

		return false;
	}
	
	// Hide "add entry" section
	function endAddMode() {
		
		// Get rid of selectables
		$schedule.selectable('destroy');
		$('.ui-selected').removeClass('ui-selected');
		$(".schedule td").unbind('mousedown');
		
		// We're done with input value, so empty it
		$entry_username.val('');

		//Remove other input values
		$('.entry-username').not(':first').remove();
		
		// Make entries deletable
		$schedule.find('.deletable').attr('title','Click to delete');
		
		return false;
	}
	
	// Add entries to table
	function addEntries() {
		
		// Get selected table cells
		var $selected = $('.ui-selected');

		if($selected.length == 0) {

			$error.message("Hey!"," You didn't select any times.")

		} else {

			var day = [];
			var hour = [];

			$('.ui-selected').each( function() {
				hour.push($(this).attr('data-x'));
				day.push($(this).attr('data-y'));
			});

			//go through all the usernames submitted
			$('.entry-username').each(function() {
				
				//var entryUsername = $('.entry_username').val();
				var entryUsername = $(this).val();
				entryUsername = $.trim(entryUsername);

				//check to see if submitted username is in list of users
				var regDJ = false;
				for (var i = users.length - 1; i >= 0; i--) {
					if(entryUsername == users[i].local.username) regDJ = true;
				};
				
				if (!entryUsername) {
					$error.message("Hey!", "You didn't enter a name.");
				} else if (!regDJ) {
					$error.message(entryUsername," is not yet in the system.")
				} else {
					// Add entry to each selected cell
					var entry = '<span class="entry">' + entryUsername + '</span>';
					if($('.entry-username').length > 1) entry += " & ";
		   			$selected.addClass('active deletable');

					$selected.append(entry);

					$selected.attr("data-username",entryUsername);

					// Close the section
					endAddMode();
					
					$info.message(entryUsername, " has been added.");

					for (var i = 0; i <= day.length - 1; i++) {

						var n = day[i] - 1;
						var m = hour[i] - 3;
						if(m<1){
							m = m+24;
						}
						
						if(djSchedule[n][m]==" ") {

							if(i == 0) {
								var info = {"name": entryUsername, "colspan": day.length};
							} else {
								var info = {"name": entryUsername};
							}

							djSchedule[n][m] = info;


						} else {

							var current = djSchedule[n][m].name + " " + entryUsername;
							djSchedule[n][m].name = current;
						
						}

						//console.log("m: "+m);
						//console.log("hour[i]: "+hour[i]);
					};

					var weekDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

					var showTime = {'username': entryUsername,
									'startTime': parseInt(hour[0]),
									'endTime': parseInt(hour[hour.length-1]) + 1,
									'dayOfWeek': weekDays[(parseInt(day[0])-1)]}

					djUpdates.push(showTime);

					console.log(JSON.stringify(djSchedule));
					console.log(JSON.stringify(djUpdates));

				}

			});

		}
		
		return false;
	}
	
	// Delete entry from the table
	function removeEntry() {
		var name = $(this).attr("data-username");
		var hour = $(this).attr("data-x");

		var id = $(this).attr("data-id");
			$(this).html("");
			$(this).removeClass("active");
			$(this).removeClass("deletable");
			$(this).removeAttr("title");
			$(this).removeAttr("data-username");

		//delete user from arrays
		
		for (var i = djSchedule.length - 1; i >= 0; i--) {
			for (var n = djSchedule[i].length - 1; n >= 0; n--) {
				if(djSchedule[i][n].name == name) {
					djSchedule[i][n] = " ";
				}
			};
		};
	
		for (var i = djUpdates.length - 1; i >= 0; i--) {
			if(djUpdates[i].username===name) {
				//check to see where in the span this cell falls
				if(hour == djUpdates[i].startTime ) {
					//if the hour is the first hour of the range
					//move the start time up an hour
					djUpdates[i].startTime = (parseInt(djUpdates[i].startTime)+1);
				} else if (hour == (parseInt(djUpdates[i].endTime)-1)) {
					//if the hour is the last hour of the range
					//move the end time down an hour
					djUpdates[i].endTime = (parseInt(djUpdates[i].endTime)-1);
				} else if (parseInt(djUpdates[i].endTime) == (parseInt(djUpdates[i].startTime) +1)) {
					//if the dj's show is only an hour
					//remove it from the array
					djUpdates.splice(i, 1);
				} else if (djUpdates[i].startTime < hour < (parseInt(djUpdates[i].endTime)-1)) {
					//if the show is in the middle of the range, not the start or end hours
					//disregard it
					djUpdates[i].disregard = hour;
					//this needs fix for if someone goes and takes away another the first or last time
				}
			}
		};

		console.log(JSON.stringify(djUpdates));

		return false;
	}
	
	// Delete all entries from the table
	function removeEntries() {
		// Find all entries
		var $entries = $schedule.find('.active');
		
		// Delete them
			$entries.html("");
			$entries.removeClass("active");
			$entries.removeClass("deletable");
			$entries.removeClass("deleting");
			$entries.removeAttr("title");
			$entries.removeAttr("data-name");
			$entries.removeAttr("data-id");
			$entries.removeAttr("data-show");
			$entries.removeAttr("data-col_index");
			$entries.removeAttr("data-row_index");
			$entries.removeAttr("data-colspan");

		djSchedule = createSchedule();
		djUpdates = [];
		
		return false;
	}
	
	// Highlight entries to be deleted to cue user of deletion action
	function removeEntriesHighlight() {
		$('.entry').parent().addClass('deleting');
	}
	
	// Undo highlight
	function removeEntriesUndoHighlight() {
		$('.entry').parent().removeClass('deleting');
	}
	
	// Generate a schedule from the table
	function generateSchedule() {
		// Clone the table
		$clone.empty()
		$schedule.clone().removeAttr('id').removeClass('ui-selectable').addClass('cloned').appendTo($clone);
		
		// Remove input fields
		// Prevent entries from deletion
		// Display random entry for each cell
		$clone
			.find('input').each(function(index) {
				var text = $(this).val();
				$(this).replaceWith('<div>' + text + '</div>');
			}).end()
			.find('.deletable').removeClass('deletable').removeAttr('title').end()
			.find('.ui-selectee').removeClass('ui-selectee').end()
			.find('.ui-selected').removeClass('ui-selected').end()
			.find('.cloned tbody td').randomChild();
			
		return false;
	}

	function showHiddenRows() {
		if(!$('table.schedule').hasClass('expanded')){
			$('table.schedule tr.collapsed').css('display','table-row');
			$('table.schedule').addClass('expanded');
			$('.show-rows').text('Hide times');
		} else {
			$('table.schedule tr.collapsed').css('display','none');
			$('table.schedule').removeClass('expanded');
			$('.show-rows').text('Show hidden times');
		}
	}

	function addCoHost() {

		var fields = $('.add-entry-form input[type="text"]');

		var count = fields.length + 1;

		var newInput = $("<input type='text'>")
			.attr('class','entry-username')
			.attr('name','entry-username-' + count)
			.attr('placeholder','DJ Username')

		newInput.insertAfter(fields[(fields.length -1)]);
		newInput.focus();
	}

	function publish(event) {

		if(event.handled !== true) {

			//var req = {'schedule': djSchedule, 'djs': djUpdates};
			/*req = req.toString();
			console.time("ajax call");
			$.ajax({
			    url: "/admin/scheduler",
			    data : {'schedule': djSchedule, 'djs': djUpdates},
			    type: 'POST',          
                dataType: 'json',
			    success: function(result){
			        //showResultsToUser(result);
			        //clearTimeout(cancelMe); // don't run if it hasn't run yet
			        //$('#loading').hide(); // hide the loading element if it's shown
			        console.timeEnd("ajax call");
			        alert("Size is " + req.getResponseHeader("Content-Length"));
			        console.log("done");
					window.location.replace('/admin/library');
					console.log("really done");

			    }
			});*/
		    $.post('/admin/scheduler',{'schedule': djSchedule, 'djs': djUpdates}, function() {
		    	console.log("done");
				window.location.replace('/admin/library');
			});

		    event.handled = true;
	  	}
	  return false;
	}



});




;(function($) {

	// My extensions
	$.fn.message = function(strongText, plainText) {
		return this.each(function() {			
			$(this)
				.empty().fadeIn()
				.html('<p><strong>' + strongText + '</strong> ' + plainText + '</p>')
				.delay(2000).fadeOut();
		});
	};
})(jQuery);

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function createSchedule() {
	return [
			[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
			[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
			[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
			[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
			[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
			[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
			[' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ']
		]
}

function renderSchedule () {
	console.log('rendering schedule');
	for (var i = 0; i <= djSchedule.length - 1; i++) {
		for (var n = 0; n <= djSchedule[i].length - 1; n++) {
			//traverse the array by day, then by hour
			//figure out which cell you are in
			//replace the contents of the cell if there are contents to replace
			//add the right classes

			var x = n + 3;
			if (x > 24) x = x - 24;


			$cell = $('td[data-x="'+x+'"][data-y="'+(i+1)+'"]');

			var name = djSchedule[i][n].name;
			if(name) $cell.html("<span class='entry'>"+name+"</span>").addClass("active deletable");

		};
	};

}

function originalDJs() {
	var djs = [];
	for (var i = users.length - 1; i >= 0; i--) {
		//if(users[i]) 
	};
}



















