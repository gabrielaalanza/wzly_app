$( document ).ready(function() {

	//change table to reflect desired charts
	$("select").change(function() {

		var pastChart;

		var date = $("select option:selected").attr('data-date');
		//date = new Date(date);

		if(date=="Choose date"){
			$('.zero-state').removeClass('hide');
			$('.table-pastCharts').addClass('hide');
		} else {

			for (var i = local_data.length - 1; i >= 0; i--) {
				var d = new Date(local_data[i].date);
				if(date == d){
					pastChart = local_data[i].list;
					break;
				}
			};

			$('.table-pastCharts tbody tr').remove();
			
			for (var i = pastChart.length - 1; i >= 0; i--) {
				$('.table-pastCharts tbody').prepend('<tr><td>'+(i+1)+'.'
																+'</td><td>'+pastChart[i].artist
																+'</td><td>'+pastChart[i].album
																+'</td><td>'+pastChart[i].count
																+'</td>+</tr>');
			};
		
			$('.zero-state').addClass('hide');
			$('.table-pastCharts').removeClass('hide');

		}

	});
	
});
