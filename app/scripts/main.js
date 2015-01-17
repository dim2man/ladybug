$(function() {
  'use strict';
  var $win = $(window), width, height, curDragImg;

  function updateSize() {
    width = $win.width();
    height = $win.height(); 
  }
  updateSize();
  $win.on('resize', updateSize);

  function init() {
    $('img').each(function() {
      // place
      var $img = $(this),
        w = $img.width(),
        h = $img.height(),
        t = Math.floor(Math.random()*(height - h)),
        l = Math.floor(Math.random()*(width - w));
      $img.css({
        top: t+'px',
        left: l+'px'
      });

      // drag
      $img.on('click', function(e) {
        // start drag
        var prevX, prevY;
        if ($img === curDragImg) {
          return;
        }
        prevX = e.pageX;
        prevY = e.pageY;
        $img.addClass('active');
        curDragImg = $img;
        e.stopPropagation();

        $win.on('mousemove', function(e) {
          //move
          l += e.pageX - prevX;
          t += e.pageY - prevY;
          prevX = e.pageX;
          prevY = e.pageY;
          $img.css({
            top: t+'px',
            left: l+'px'
          });
        }); 
        $win.on('click', function() {
          //finish
          curDragImg = null;
          $img.removeClass('active');
          $win.off('mousemove');
          $win.off('click');
          if ($img.hasClass('flower')) {
            checkFlowers();
          } else {
            checkLadyBugs();
          }
        });
      });
    });
  }
  init();

  function checkFlowers() {
    var left, prevleft, ordered = true;
    for(var i=0; i<5; i++) {
      left = parseInt($('.flower'+(i+1)).css('left'), 10);
      if (prevleft !== undefined && left <= prevleft) {
        ordered = false;
        break;
      }
      prevleft = left;
    }    
    if (ordered) {
      $('.flower').off('click');
      $('.ladybug').css('visibility', 'visible');
    }
  }

  function checkLadyBugs() {

  }
});