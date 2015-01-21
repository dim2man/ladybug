$(function() {
  'use strict';
  var $win = $(window),
    $targets = $('.targets'),
    $flower = $('.flower'),
    $ladybug = $('.ladybug'),
    numFlowers = $flower.size(),
    numLadybugs = $ladybug.size(),
    audio,
    AUDIO_OK = 'sound/bonus.wav',
    AUDIO_NOK = 'sound/crash.wav',
    AUDIO_GOOD = 'sound/good.ogg',
    AUDIO_NUM = 'sound/U003_.ogg',
    AUDIO_LADYBUG = 'sound/level.wav',
    numLadybugPlaced;

  if (Audio) {
    audio = new Audio();
  }

  function play(sound) {
    if (!audio) {
      return;
    }
    audio.src = sound;
    audio.play();
  }

  // $win.on('resize', updateSize);

  function init() {
    $('#btnstart, #btnagain').on('click', function() {
      numLadybugPlaced = 0;
      placeFlowers();
      $('.banner').hide();
    });
  }
  init();

  function placeFlowers() {
    var center = {
      x: $win.width()/2,
      y: ($win.height() - $targets.height())/2
    };
    var $flower1 = $('#flower1'),
      flowerW = $flower1.width(),
      flowerH = $flower1.height(),
      flowerR = Math.max(flowerW, flowerH)/2;
    var radius = flowerR/Math.sin(Math.PI/numFlowers);
    var angles = [], angle = Math.PI/2, stepAngle = 2*Math.PI/numFlowers;
    var i;
    for(i=0; i<numFlowers; i++) {
      angles[i] = angle;
      angle += stepAngle;
    }
    // shake
    var i1, i2, tmp;
    for(i=0; i<50; i++) {
      i1 = Math.floor(Math.random()*numFlowers);
      i2 = Math.floor(Math.random()*numFlowers);
      tmp = angles[i2];
      angles[i2] = angles[i1];
      angles[i1] = tmp;
    }
    $flower.addClass('draggable').on('click', function() {
      play(AUDIO_NOK);
    }).each(function(index) {
      var origPos = {
        top: (center.y - Math.sin(angles[index])*radius - flowerH/2)+'px',
        left: (center.x + Math.cos(angles[index])*radius - flowerW/2)+'px'
      };
      $(this).css(origPos).data('origPos', origPos);
    });
    $flower.css('visibility', 'visible');
    $ladybug.css('visibility', 'hidden');
    $('#btnagain').css('visibility', 'hidden');
    enableDrag($flower1, flowerDragged);
  }

  function placeLadyBugs() {
    var cy = $targets.height()/2;
    var $ladybug1 = $('#ladybug1'),
      ladybugW = $ladybug1.width(),
      ladybugH = $ladybug1.height();
    var cxs = [], stepcx = $win.width()/numLadybugs, cx = stepcx/2;
    var i;
    for(i=0; i<numLadybugs; i++) {
      cxs[i] = cx;
      cx += stepcx;
    }
    // shake
    var i1, i2, tmp;
    for(i=0; i<50; i++) {
      i1 = Math.floor(Math.random()*numLadybugs);
      i2 = Math.floor(Math.random()*numLadybugs);
      tmp = cxs[i2];
      cxs[i2] = cxs[i1];
      cxs[i1] = tmp;
    }
    $ladybug.addClass('draggable').each(function(index) {
      var origPos = {
        top: (cy - ladybugH/2)+'px',
        left: (cxs[index] - ladybugW/2)+'px'
      };
      $(this).css(origPos).data('origPos', origPos);
      enableDrag($(this), ladybugDragged);
    });
    $ladybug.css('visibility', 'visible');
  }

  function enableDrag($img, ondragged) {
    var curDragImg;
    $img.off('click');
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
      var id = $img.attr('id');
      var index = id.replace(/[^\d]*/,'');
      if (id.indexOf('flower') > -1) {
        play(AUDIO_NUM.replace('_', index));
      } else {
        play(AUDIO_LADYBUG);
      }

      $win.on('mousemove', function(e) {
        //move
        var pos = $img.position();
        $img.css({
          top: (pos.top + e.pageY - prevY)+'px',
          left: (pos.left + e.pageX - prevX)+'px'
        });
        prevX = e.pageX;
        prevY = e.pageY;
      }); 
      $win.on('click', function() {
        //finish
        curDragImg = null;
        $img.removeClass('active');
        $win.off('mousemove');
        $win.off('click');
        if (ondragged) {
          ondragged($img);
        }
      });
    });
  }

  function disableDrag($img) {
    $img.removeClass('draggable');
    $img.off('click');
  }

  function flowerDragged($img) {
    var flowerIndex = +$img.attr('id').replace(/[^\d]*/,''),
      $target = $('#target'+flowerIndex),
      tpos = $target.offset(),
      ipos = $img.position(),
      cx = ipos.left + $img.width()/2,
      cy = ipos.top + $img.height()/2;
    tpos.right = tpos.left + $target.width();
    tpos.bottom = tpos.top + $target.height();

    if  (cx >= tpos.left && cx <= tpos.right && cy >= tpos.top && cy <= tpos.bottom ) {
      // flower is on target
      disableDrag($img);
      $img.css({
        top: ((tpos.bottom + tpos.top)/2 - $img.height()/2)+'px',
        left: ((tpos.right + tpos.left)/2 - $img.width()/2)+'px'
      });
      if (flowerIndex < numFlowers) {
        play(AUDIO_OK);
        enableDrag($('#flower'+(flowerIndex+1)), flowerDragged);
      } else {
        play(AUDIO_GOOD);
        placeLadyBugs();
      }
    } else {
      // target missed
      play(AUDIO_NOK);
      $img.css($img.data('origPos'));
    }
  }

  function ladybugDragged($img) {
    var ladybugIndex = +$img.attr('id').replace(/[^\d]*/,''),
      $target = $('#flower'+ladybugIndex),
      tpos = $target.position(),
      ipos = $img.position(),
      cx = ipos.left + $img.width()/2,
      cy = ipos.top + $img.height()/2;
    tpos.right = tpos.left + $target.width();
    tpos.bottom = tpos.top + $target.height();

    if  (cx >= tpos.left && cx <= tpos.right && cy >= tpos.top && cy <= tpos.bottom ) {
      // ladybug is on target
      disableDrag($img);
      $img.css({
        top: ((tpos.bottom + tpos.top)/2 - $img.height()/2)+'px',
        left: ((tpos.right + tpos.left)/2 - $img.width()/2)+'px'
      });
      numLadybugPlaced++;
      if (numLadybugPlaced < numLadybugs) {
        play(AUDIO_OK);
      } else {
        play(AUDIO_GOOD);
        $('#btnagain').css('visibility', 'visible');
      }
    } else {
      // target missed
      play(AUDIO_NOK);
      $img.css($img.data('origPos'));
    }
  }

});