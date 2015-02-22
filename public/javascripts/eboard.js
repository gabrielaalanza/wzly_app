$( document ).ready(function() {

    var user = local_data;
    //populate fields with info

    if(user.eboard.year) $('[name="year"]').val(user.eboard.year);
    if(user.eboard.animal) $('[name="animal"]').val(user.eboard.animal);
    if(user.eboard.bands) $('[name="bands"]').val(user.eboard.bands);
    if(user.eboard.concert) $('[name="concert"]').val(user.eboard.concert);
    if(user.eboard.thoughts) $('[name="thoughts"]').val(user.eboard.thoughts);
    if(user.eboard.interview) $('[name="interview"]').val(user.eboard.interview);

});