$(function() {
	
	// Initialize some jQuery objects
	var 
		$error = $('.error'),
		$info = $('.info'),
		$entry_username = $('.entry-username'),
		$schedule = $('.schedule'),
		$clone = $('#clone'),
		$generate = $('#generate');

	renderSchedule();
	
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
				hour.push(parseInt($(this).attr('data-x')));
				day.push(parseInt($(this).attr('data-y')));
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

					//Add user's show to the database
					var showTime = {'username': entryUsername,
									'y': day[0],
									'x': hour}

					addToSchedule(showTime);

				}

			});

		}
		
		return false;
	}
	
	// Delete entry from the table
	function removeEntry() {
		var name = $(this).closest("td").find(".entry").html().split(" &amp; ");
		var hour = parseInt($(this).attr("data-x"));
		var day = parseInt($(this).attr("data-y"));

		var id = $(this).attr("data-id");
			$(this).html("");
			$(this).removeClass("active");
			$(this).removeClass("deletable");
			$(this).removeAttr("title");
			$(this).removeAttr("data-username");

		for (var i = name.length - 1; i >= 0; i--) {
			var showTime = {'username': name[i],
									'y': day,
									'x': hour}
			deleteFromSchedule(showTime);
		};

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

		deleteAll();
		
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

function renderSchedule () {
	console.log('rendering schedule');
	for (var i = users.length - 1; i >= 0; i--) {
		for (var n = users[i].show.length - 1; n >= 0; n--) {
			for (var m = users[i].show[n].showTime.x.length - 1; m >= 0; m--) {
				var $cell = $('td[data-y="'+users[i].show[n].showTime.y+'"][data-x="'+users[i].show[n].showTime.x[m]+'"]');
				if($cell.find('.entry').length){
					$cell.find('.entry').append(' & '+users[i].local.username);
				} else {
					$cell.html("<span class='entry'>"+users[i].local.username+"</span>").addClass("active deletable");	
				}
			};
		};
	};
}

function addToSchedule(showTime) {
	$.post('/admin/add-schedule',{'data': showTime}, function() {
    	console.log("done");
	});
}

function deleteFromSchedule(showTime) {
	$.post('/admin/delete-schedule',{'data': showTime}, function() {
    	console.log("done");
	});
}

function deleteAll() {
	$.post('/admin/clear-schedule', function() {
    	console.log("done");
	});
}













