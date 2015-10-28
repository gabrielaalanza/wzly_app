$( document ).ready(function() {

    if(user.live) {
        $('.pulse').show();
    }

	var profile = user;

    console.log(profile);

    $('[name="bio"]').val(profile.bio);
    if(profile.bands) {
        if(profile.bands.band1) $('[name="band1"]').val(profile.bands.band1);
        if(profile.bands.band2) $('[name="band2"]').val(profile.bands.band2);
        if(profile.bands.band3) $('[name="band3"]').val(profile.bands.band3);
        if(profile.bands.band4) $('[name="band4"]').val(profile.bands.band4);
        if(profile.bands.band5) $('[name="band5"]').val(profile.bands.band5);
    }

    var input_element = $('[name="picture"]');
    $(input_element).change(function() {
        s3_upload();
    });
});

function s3_upload(){
    var status_elem = $('.status');
    var url_elem = $('#avatar_url');
    var preview_elem = $('.prof-pic');
    var s3upload = new S3Upload({
        file_dom_selector: 'files',
        s3_sign_put_url: '/app/sign_s3',
        onProgress: function(percent, message) {
            console.log('uploading')
            $('.status').html('Upload progress: ' + percent + '% ' + message);
        },
        onFinishS3Put: function(public_url) {
            console.log('finished uploading');
            $('.status').html('Upload completed. Please save your changes.');
            $('#avatar_url').val(public_url);
            $('.prof-pic').attr('src', public_url);
        },
        onError: function(status) {
            console.log('error');
            $('.status').html('Upload error: ' + status);
        }
    });
}