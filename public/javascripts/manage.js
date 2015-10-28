$( document ).ready(function() {

    $('.clear-semester').click(function() {
        $('.clear-modal').modal('show');
        $('.clear-modal h3').text("Clear this semester's data");
        $('.clear-form').attr('action','/admin/clear-semester');
        $('.clear-form button.primary').text('Clear semester');
    });

    $('.clear-year').click(function() {
        $('.clear-modal').modal('show');
        $('.clear-modal h3').text("Clear this year's data");
        $('.clear-form').attr('action','/admin/clear-year');
        $('.clear-form button.primary').text('Clear year');
    });
})