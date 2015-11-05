$( document ).ready(function() {

    $('.clear-semester').click(function() {
        $('.clear-modal').modal('show');
        $('.clear-modal h3').text("Clear this semester's data");
        $('.clear-form').attr('action','/admin/clear-semester');
        $('.clear-form button.primary').text('Clear semester');
        $('.clear-form input[name="password"]').focus();
    });

    $('.clear-year').click(function() {
        $('.clear-modal').modal('show');
        $('.clear-modal h3').text("Clear this year's data");
        $('.clear-modal .manage-info').text("To clear this data, please enter the Admin password. Because your user will be deleted (unless you are logged in under the Admin user), this will log you out of Airwave.");
        $('.clear-form').attr('action','/admin/clear-year');
        $('.clear-form button.primary').text('Clear year');
        $('.clear-form input[name="password"]').focus();
    });

    $(".clear-form button[type='submit']").click(function() {

        event.preventDefault();

        var path = $('.clear-form').attr('action');
        var password = $('input[name="password"]').val();

        $.post(path, {password:password}, function(data) {
            $('.clear-form')[0].reset();
            $('.clear-modal').modal('hide');
            console.log(data);
            if (path == '/admin/clear-year' && user.local.username != "admin") {
                window.location.href = '/login';
            } else if(data) {
                $('.alert-message').show().text(data);
            }
        });  

    });
})