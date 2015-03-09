$( document ).ready(function() {

	var profile = user;

	//populate fields with information
    $('[name="showName"]').val(profile.showName);
    $('[name="bio"]').val(profile.bio);
    if(profile.bands) {
        if(profile.bands.band1) $('[name="band1"]').val(profile.bands.band1);
        if(profile.bands.band2) $('[name="band2"]').val(profile.bands.band2);
        if(profile.bands.band3) $('[name="band3"]').val(profile.bands.band3);
        if(profile.bands.band4) $('[name="band4"]').val(profile.bands.band4);
        if(profile.bands.band5) $('[name="band5"]').val(profile.bands.band5);
    }
});