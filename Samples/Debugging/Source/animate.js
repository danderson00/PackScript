function animate(element, target) {
    $(element)
        .appendTo(target)
        .addClass('animateTarget')
        .animate({ left: $(target).width() / 2 })
        .animate({ 'font-size': 100 })
        .animate({ 'font-size': 16 })
        .animate({ left: $(target).width() });
}