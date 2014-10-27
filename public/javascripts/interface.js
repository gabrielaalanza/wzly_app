$( document ).ready(function() {

	//define colors for menu rollovers/active states
	var pink = "#F2385A";
	var ltyellow = "#FAE07A";
	var dkyellow = "#F5A503";
	var ltBlue = "#94F5EE";
	var blue = "#36B1BF";
	var green = "#2ECC71";



	//show first divs
	$(".log").show();
	$(".musicmanager").show();
	$(".musiclog").css("border-bottom-color",pink);
	$(".manager").css("border-bottom-color",pink);
	$('.musicmanager-charts').hide();
	$('.op1').toggleClass('dotted');



	//Date handling
	var now = new Date();
	$("input[name=playlist_date]").val(now);
	displayDate(now);

	$('.change-date').datepicker()
		.on('changeDate', function(ev){
			var newDate = new Date(ev.date);
			displayDate(newDate);
			$("input[name=playlist_date]").val(newDate);
    		$('.change-date').datepicker('hide');
    	});
	$('.change-date').datepicker('setValue', now);
	$('.change-date').click(function(){
		$('.change-date').datepicker('show');
	});

	/*$('.event-date').datepicker('setValue', now)
		.on('changeDate', function(ev){
				var newDate = new Date(ev.date);
	    		$('.event-date').datepicker('hide');
	    	});*/



	//show and hide subviews within music manager, show dotted line on top sub-menu
	$('.top-menu li').hover(function(){
		$(this).toggleClass('dotted');
	});

	$('.op1').click(function(){
		$('.musicmanager-charts').hide();
		$('.musicmanager-library').show();
		$(this).toggleClass('dotted');
		$('.op2').toggleClass('dotted');
	});

	$('.op2').click(function(){
		$('.musicmanager-library').hide();
		$('.musicmanager-charts').show();
		$(this).toggleClass('dotted');
		$('.op1').toggleClass('dotted');

	});



	//change title of eboard member being edited
	$('.pic-box').click(function(){
		var title = $(this).text();
		$('.eboard-fields h3').text(title);
		var arr = $(this).attr('class').replace(/\s+/,' ').split(' ');
		$("input[name=member_id]").val(setId(arr[1]));
	});



	//update hidden field on events model
	$('.start_hour, .start_minute, .start_ampm').change(function(){
		updateStartField();
	});

	$('.end_hour, .end_minute, .end_ampm').change(function(){
		updateEndField();
	});


	// show/hide divs on click
	$(".musiclog").click(function(){
		$(".control").hide();
		$(".side-menu ul li").css("border-bottom-color","");
		$(".musiclog").css("border-bottom-color",pink);
		$(".log").fadeIn();
	});
	$(".viewplaylists").click(function(){
		$(".control").hide();
		$(".side-menu ul li").css("border-bottom-color","");
		$(".viewplaylists").css("border-bottom-color",blue);
		$(".playlists").fadeIn();
	});
	$(".manageprof").click(function(){
		$(".control").hide();
		$(".side-menu ul li").css("border-bottom-color","");
		$(".manageprof").css("border-bottom-color",dkyellow);
		$(".profile").fadeIn();
	});
	$(".manager").click(function(){
		$(".control").hide();
		$(".side-menu ul li").css("border-bottom-color","");
		$(".manager").css("border-bottom-color",pink);
		$(".musicmanager").fadeIn();
	});
	$(".schedule").click(function(){
		$(".side-menu ul li").css("border-bottom-color","");
		$(".schedule").css("border-bottom-color",blue);
	});
	$(".events").click(function(){
		$(".control").hide();
		$(".side-menu ul li").css("border-bottom-color","");
		$(".events").css("border-bottom-color",dkyellow);
		$(".eventsmanager").fadeIn();
	});
	$(".board").click(function(){
		$(".control").hide();
		$(".side-menu ul li").css("border-bottom-color","");
		$(".board").css("border-bottom-color",ltBlue);
		$(".boardmanager").fadeIn();
	});
	$(".users").click(function(){
		$(".control").hide();
		$(".side-menu ul li").css("border-bottom-color","");
		$(".users").css("border-bottom-color",green);
		$(".usermanager").fadeIn();
	});



	//clear events modal when hidden
	$('.events-modal').on('hidden.bs.modal', function () {
		
		$('.event-form')[0].reset();
		$(".cancel-button").hide();
		$(".spam_view").text("There is no spam for this event uploaded.");
	
	});



	//check to see if event should be updated or deleted
	$(".event-form button").click(function() {
	    $('input[name="submitSource"').val($(this).attr("name"));
	    return true;
	});

});


function backToWhite(item) {
	$(item).css("border-bottom-color","white");
}

function displayDate(date) {

	var dateNum = date.getDate();
		var year = date.getFullYear();

		var monthArr=new Array();
		monthArr[0]="January";
		monthArr[1]="February";
		monthArr[2]="March";
		monthArr[3]="April";
		monthArr[4]="May";
		monthArr[5]="June";
		monthArr[6]="July";
		monthArr[7]="August";
		monthArr[8]="September";
		monthArr[9]="October";
		monthArr[10]="November";
		monthArr[11]="December";
		var month = monthArr[date.getMonth()];

		var dayArr=new Array();
		dayArr[0]="Sunday";
		dayArr[1]="Monday";
		dayArr[2]="Tuesday";
		dayArr[3]="Wednesday";
		dayArr[4]="Thursday";
		dayArr[5]="Friday";
		dayArr[6]="Saturday";
		var day = dayArr[date.getDay()];

	$('.current-date').html( day + " " + month + " " + dateNum + ", " + year);
};

function updateStartField(){
	var hour = parseInt($(".start_hour").val());
	var minute = parseInt($(".start_minute").val());
	var ampm = $(".start_ampm").val();
	if(ampm=="PM") hour = hour + 12;
	/*var theDate = $(".event-date").val();
	var dateArr = theDate.split("-");
	for (var i = dateArr.length - 1; i >= 0; i--) {
		dateArr[i] = parseInt(dateArr[i]);
	};	
	var month = dateArr[1]-1;
	var day = dateArr[2];
	var date = new Date(1970, 1, 1, hour, minute, 0, 0);*/
	$("input[name=event_start]").val(hour+":"+minute+":00");
}

function updateEndField(){
	var hour = parseInt($(".end_hour").val());
	var minute = parseInt($(".end_minute").val());
	var ampm = $(".end_ampm").val();
	if(ampm=="PM") hour = hour + 12;
	/*var theDate = $(".event-date").val();
	var dateArr = theDate.split("-");
	for (var i = dateArr.length - 1; i >= 0; i--) {
		dateArr[i] = parseInt(dateArr[i]);
	};	
	var month = dateArr[1]-1;
	var day = dateArr[2];
	var date = new Date(1970, 1, 1, hour, minute, 0, 0);*/
	$("input[name=event_end]").val(hour+":"+minute+":00");
}

function setId(name){
	var titleArr = ["gm", "sec", "emd", "imd", "pro", "pub", "sam", "prg", "tch", "se1", "se2", "int", "lib", "mon", "new"];
	return titleArr.indexOf(name)+1;
}

function checkFields() {
	updateStartField();
	updateEndField();
	return true;
}

function addPlaylistDate() {
	var hour = parseInt($(".end_hour").val());
	var minute = parseInt($(".end_minute").val());
	var ampm = $(".end_ampm").val();
	if(ampm=="PM") hour = hour + 12;
	$("input[name=event_end]").val(hour+":"+minute+":00");
	return true;
}
