$( document ).ready(function() {

	var profile = user;

	//populate fields with information
    $('[name="showName"]').val(profile.showName);
    $('[name="bio"]').val(profile.bio);
    $('[name="band1"]').val(profile.bands.band1);
    $('[name="band2"]').val(profile.bands.band2);
    $('[name="band3"]').val(profile.bands.band3);
    $('[name="band4"]').val(profile.bands.band4);
    $('[name="band5"]').val(profile.bands.band5);
	
});