$(function() {
    $('button').click(function() {
        var target = $('<div/>').html($('input').val());
        animate(target, $('.output'));
    });
});
