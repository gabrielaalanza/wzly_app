$(function() {
	
	// Initialize some jQuery objects
	var 
		$error = $('#error'),
		$info = $('#info'),
		$entry_section = $('#add-entry-section'),
		$entry_name = $('#entry-name'),
		$entry_show = $('#entry-show'),
		$entry_id = $('#entry-id'),
		$schedule = $('#schedule'),
		$clone = $('#clone'),
		$generate = $('#generate');
	
	// Start the setup
	init();
	
	// Setup code
	function init() {
		// Hide Stuff
		$entry_section.hide();
		$error.hide();
		$info.hide();
		
		// Activate buttons
		$('#add-entry').click(openEntrySection);
		$('#save').click(addEntries);
		$('#cancel').click(closeEntrySection);
		$('#add-entry-form').submit(addEntries);
		$('#add-row')
			.click(addRow)
			.hover(addRowHighlight, addRowUndoHighlight);
		$('#remove-row')
			.click(removeRow)
			.hover(removeRowHighlight, removeRowUndoHighlight);
		$('#remove-entries')
			.click(removeEntries)
			.hover(removeEntriesHighlight, removeEntriesUndoHighlight);
		$('#generate').click(generateSchedule);
		
		// Whenever entries are created, let them be deletable
		$('.deletable').live('click', removeEntry);
		
		// Prevent text selection on double-click
		$('.actions a')
			.attr('unselectable','on')
			.css('MozUserSelect','none')
			.bind('selectstart.ui', function() {
				return false;
			});

		//highlight td and th on hover
		$("td").hover(function(){
			$(this).closest('table').find('th').eq($(this).index()).toggleClass("active");
			$(this).parent('tr').find('th:first').toggleClass("active");

		});
	}
	
	// Add a row to the table
	function addRow() {
		$schedule.find('tbody').append('<tr><th><input type="text" /></th><td></td><td></td><td></td><td></td><td></td><td></td><<td></td><</tr>');
		addRowUndoHighlight();
		addRowHighlight();
		return false;
	}
	
	// Highlight bottom row of table to cue user of add action
	function addRowHighlight() {
		$schedule.find('tbody tr:last-child *').addClass('adding');
	}
	
	// Undo highlight
	function addRowUndoHighlight() {
		$schedule.find('tbody tr *').removeClass('adding');
	}
	
	// Delete last row from the table
	function removeRow() {
		$schedule.find('tbody tr').last().remove();
		removeRowUndoHighlight();
		removeRowHighlight();
		return false;
	}
	
	// Highlight row to be deleted to cue user of delete action
	function removeRowHighlight() {
		$schedule.find('tbody tr:last-child *').addClass('deleting');
	}
	
	// Undo highlight
	function removeRowUndoHighlight() {
		$schedule.find('tbody tr *').removeClass('deleting');
	}
	
	// Show "add entry" section
	function openEntrySection() {
		// Prevent entry deletion when section is open
		$schedule.find('.entry').removeClass('deletable').removeAttr('title');
		
		// Show section
		$entry_section.slideDown(function() {
			$entry_name.focus();
		});
		
		// Make the table cells selectable
		$schedule.selectable({
			filter: 'td'
		});

		$("td").hover(function(){
			
		});
		
		return false;
	}
	
	// Hide "add entry" section
	function closeEntrySection() {
		// Hide section
		$entry_section.slideUp();
		
		// Get rid of selectables
		$schedule.selectable('destroy');
		$('.ui-selected').removeClass('ui-selected');
		
		// We're done with input value, so empty it
		$entry_name.val('');
		$entry_show.val('');
		$entry_id.val('');
		
		// Make entries deletable
		$schedule.find('.deletable').attr('title','Click to delete');
		
		return false;
	}
	
	// Add entries to table
	function addEntries() {
		var entryName = $entry_name.val();
		var entryId = $entry_id.val();
		var entryShow = $entry_show.val();
		entryName = $.trim(entryName);
		entryId = $.trim(entryId);
		entryShow = $.trim(entryShow);
		
		// Get selected table cells
		var $selected = $('.ui-selected');
		
		if (!entryName) {
			$error.message("Hey!", "You didn't enter a name.");
		} else if (!entryId) {
			$error.message("Hey!", "You didn't enter a username.");
		} else if (!$selected.length) {
			$error.message("Hey!", "You didn't select anything.");
		} else {
			// Add entry to each selected cell
			var entry = '<span class="entry">' + entryName + '</span>';
   			$selected.addClass('active deletable');

			$selected.append(entry);

			$selected.attr("data-name",entryName);
			$selected.attr("data-id",entryId);
			$selected.attr("data-show",entryShow);
			$selected.attr("data-col_index",$selected.index()+1);
			$selected.attr("data-row_index",$selected.parent('tr').index()+1);
			$selected.attr("data-colspan",$selected.length);

			// Close the section
			closeEntrySection();
			
			$info.message(entryName, " has been added.");

			updateCollection(entryName, entryShow, entryId, $selected.index()+1, $selected.parent('tr').index()+1, $selected.length);
		}
		
		return false;
	}
	
	// Delete entry from the table
	function removeEntry() {
		var id = $(this).attr("data-id");
			$(this).html("");
			$(this).removeClass("active");
			$(this).removeClass("deletable");
			$(this).removeAttr("title");
			$(this).removeAttr("data-name");
			$(this).removeAttr("data-id");
			$(this).removeAttr("data-show");
			$(this).removeAttr("data-col_index");
			$(this).removeAttr("data-row_index");
			$(this).removeAttr("data-colspan");

		removeFromCollection(id);

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
			$entries.removeAttr("title");
			$entries.removeAttr("data-name");
			$entries.removeAttr("data-id");
			$entries.removeAttr("data-show");
			$entries.removeAttr("data-col_index");
			$entries.removeAttr("data-row_index");
			$entries.removeAttr("data-colspan");
		
		
		return false;
	}
	
	// Highlight entries to be deleted to cue user of deletion action
	function removeEntriesHighlight() {
		$('.entry').addClass('deleting');
	}
	
	// Undo highlight
	function removeEntriesUndoHighlight() {
		$('.entry').removeClass('deleting');
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



});

function depositCode() {
	$("th").removeClass("active");
	$("textarea[name=code]").val($("table#schedule tbody").html());
	sendCollection();
	return true;
}



;(function($) {
	/* 
	 * Random Child (0.1)
	 * by Mike Branski (www.leftrightdesigns.com)
	 * mikebranski@gmail.com
	 *
	 * Copyright (c) 2008 Mike Branski (www.leftrightdesigns.com)
	 * Licensed under GPL (www.leftrightdesigns.com/library/jquery/randomchild/gpl.txt)
	 */
	$.fn.randomChild = function(settings) {
		return this.each(function(){
			var c = $(this).children().length;
			var r = Math.ceil(Math.random() * c);
			$(this).children().hide().parent().children(':nth-child(' + r + ')').show();
		});
	};

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