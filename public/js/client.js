// Preloader
$(window).load(function() { // makes sure the whole site is loaded
    $('#status').fadeOut(); // will first fade out the loading animation
    $('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('body').delay(350).css({'overflow':'visible'});
})

// Sakura
// domReady
$(function() {
    $('.sak').sakura();
});

// windowLoad
$(window).load(function() {
    $('.sak').sakura('start', {
        blowAnimations: [
            'blow-medium-left'
        ],                   // Horizontal movement animation names
        className: 'sakura', // Class name to use
        fallSpeed: 1,        // Factor for petal fall speed
        maxSize: 14,         // Maximum petal size
        minSize: 9,          // Minimum petal size
        newOn: 100,          // Interval after which a new petal is added
    });
});

$(function () {
  var socket = io();
  $('form').submit(function(){
    console.log($('#m').val());
    socket.emit('chatMsg', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chatArr', function(msg){
    $('#messages').html(msg);
  });
});
