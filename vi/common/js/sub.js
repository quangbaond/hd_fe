// PC版にドロップダウンナビを実装する
// cssへのリンク先は各国に合わせて書き換え必要
$(function(){
// if文：bodyにclass名があれば実行
if($('body').is('.dropdown-navi')) { 
//dropdownNavi用のcss読み込みスクリプト
var css = document.createElement("link");
css.rel="stylesheet";
css.href="/vi/common/css/imports/components/dropdown-navi.css"; // cssへのリンク先
css.type="text/css";
document.getElementsByTagName('head')[0].appendChild(css);
//dropdownNavi実装スクリプト
$("#primary-navigation li").hover(function() {
$(this).children('ul').slideDown(200);//展開するスピード設定
}, function() {
$(this).children('ul').hide();
});
}
});


// グローバルナビのカレントを実装する
$(function(){
var id = $("body").attr("id");
$(".responsive-list li a."+id).addClass("current");
});


// svgファイル読込み
// svgファイルへのリンク先は各国に合わせて書き換え必要
$(function() {
$.ajax({
type: 'GET',
url: '/vi/common/images/svg.defs', //svgファイルへのリンク
dataType: 'html',
success: function(data){
$('body').prepend(data);
},
error: function() {
console.log('error');
}
});
});
	
	
// トップページへ戻るボタンの動き実装
$(function(){
  // #で始まるアンカーをクリックした場合に処理
  $('a[href^=#]').click(function() {

    if (!$(this).hasClass('cmnModalTrigger')) {
      // スクロールの速度
      var speed = 500; // ミリ秒
      // アンカーの値取得
      var href= $(this).attr("href");
      // 移動先を取得
      var target = $(href == "#" || href == "" ? 'html' : href);
      // 移動先を数値で取得
      var position = target.offset().top - 60;
      // スムーススクロール
      $('body,html').animate({scrollTop:position}, speed, 'swing');
    }

    return false;
  });
});


// ランゲージセレクトからマウスはずれたら自動で消える実装
$(function(){

	$('.dropdown__content').css('right','0');
	    $(".dropdown__content--open").hide();
		$(".dropdown__content--open").removeClass('dropdown__content--open');
    $('.dropdown a').focus( function () {
        $(this).next('ul').children('li:last-child').addClass('navSceondLast');
        $(this).next('ul').slideDown(200);
    });
    $('.dropdown ul li a').blur( function () {
        var navLast = $(this).parent().hasClass('navSceondLast');
        if (navLast) {
            $(this).parent().parent('ul').hide();
        }
    });
	function startTimer(){
		timer = setTimeout(syori,500);
	}
	function stopTimer(){
		clearTimeout(timer);
	}
	startTimer();
	$('.dropdown__content').on({
		'mouseenter': function(){
			stopTimer();
		},
		'mouseleave': function(){
			startTimer();
		}
	});
	function syori(){
	    $(".dropdown__content--open").hide();
		$(".dropdown__content--open").removeClass('dropdown__content--open');
	}

	var yearDropDownMenu = $(".news-year__nav li.dropdown ul.dropdown__content");
	var yearDropDownTimer;
	$(".news-year__nav li.dropdown").hover(function(){
		yearDropDownShow();
	}, function(){
		yearDropDownHide();
	});
	function yearDropDownShow(){
		clearTimeout(yearDropDownTimer);
		yearDropDownMenu.stop(false, true).slideDown(200);//展開するスピード設定
	}
	function yearDropDownHide(){
		yearDropDownTimer = setTimeout(function(){
			yearDropDownMenu.hide();
		}, 120);
	}
});

// メニューをキーボードで操作するアクセシビリティ実装
$(function(){
    $('#primary-navigation li a').focus( function () {
        $(this).parent().addClass('navfocus');
        $(this).next('ul').children('li:last-child').addClass('navSceondLast');
        $(this).next('ul').slideDown(200);
    });
    $('#primary-navigation li ul li a').blur( function () {
        var navLast = $(this).parent().hasClass('navSceondLast');
        if (navLast) {
            $(this).parent().parent().parent().removeClass('navfocus');
            $(this).parent().parent('ul').hide();
        }
    });
    $('#primary-navigation li a').bind('contextmenu', function () {
        $(this).parent().removeClass('navfocus');
    });
});

//Windowリサイズリセット
$(window).on('resize', function () {
    $('#primary-navigation li').removeClass('navfocus');
});

// フローティングする上へ戻るボタン実装
(function() {
  $(function() {
    var breakpoint, 
    common, 
    goToTop__changefixedMovePageTopFlag, 
    goToTop__checkfixedMovePageTopFlag, 
    goToTop__fixedMovePageTopFlag, 
    goToTop__onClickScrollTop, 
    goToTop__timerIDFixedMovePageTop, 
    init, 
    isL_XL,
    onResize,
    offL_XL,
    offS_M,
    onL_XL,
    onResize,
    onS_M,
    onScrollWindowL_XL, 
    onScrollWindowS_M;
    isInit = true;
    breakpoint = 768;

    init = function() {
      $(window).on('resize', onResize);
      common();
      onResize();
      return this;
    };

    // fixedトップへ戻るボタン（スクロールすると出てくるトップへ戻るボタン）
    goToTop__fixedMovePageTopFlag = false;
    goToTop__timerIDFixedMovePageTop = void 0;
    goToTop__checkfixedMovePageTopFlag = function() {
      if (goToTop__fixedMovePageTopFlag) {
        if (!$("#fixedMovePageTop").hasClass("fixed")) {
          return $("#fixedMovePageTop").addClass("fixed");
        }
      } else {
        if ($("#fixedMovePageTop").hasClass("fixed")) {
          return $("#fixedMovePageTop").removeClass("fixed");
        }
      }
    };
    goToTop__changefixedMovePageTopFlag = function(scrollVal) {
      var wh;
      wh = $(window).height();
      if (scrollVal > 0 && scrollVal + wh < $(".site-footer__legal").offset().top) {
        if (!goToTop__fixedMovePageTopFlag) {
          goToTop__fixedMovePageTopFlag = true;
        }
      } else {
        goToTop__fixedMovePageTopFlag = false;
      }
      clearTimeout(goToTop__timerIDFixedMovePageTop);
      return goToTop__timerIDFixedMovePageTop = setTimeout(function() {
        return goToTop__checkfixedMovePageTopFlag();
      }, 100);
    };

    // footerトップへ戻るボタン、fixedトップへ戻るボタン（スクロールすると出てくるトップへ戻るボタン）
    goToTop__onClickScrollTop = function() {
      return $("html, body").animate({
        scrollTop: 0
      }, 400, "swing");
    };
    onScrollWindowL_XL = function(e) {
      var s;
      s = $(this).scrollTop();
      if (!$("body").hasClass("no-fixedmovetop")) {
        goToTop__changefixedMovePageTopFlag(s);
      }
    };
    onScrollWindowS_M = function(e) {
      var s;
      s = $(this).scrollTop();
      if (!$("body").hasClass("no-fixedmovetop")) {
        goToTop__changefixedMovePageTopFlag(s);
      }
    };

    common = function() {
      // fixedトップへ戻るボタン
      if (!$("body").hasClass("no-fixedmovetop")) {
        $("body").append("<div id=\"fixedMovePageTop\"><a href=\"javascript:void(0);\"><span>↑</span></a></div>");
        $("#fixedMovePageTop a").on("click", goToTop__onClickScrollTop);
      }
    };

    onL_XL = function() {
      var filter, path;
      $(window).on("scroll", onScrollWindowL_XL);
      onScrollWindowL_XL(null);
    };
    offL_XL = function() {
      var l;
      $(window).off("scroll");
    };
    onS_M = function() {
      var filter, path;
      $(window).on("scroll", onScrollWindowS_M);
      onScrollWindowS_M(null);
    };
    offS_M = function() {
      $(window).off("scroll");
    };

    onResize = function(e) {
      if ((window.matchMedia('(max-width: ' + (breakpoint - 1) + 'px)').matches)) {
        if (isL_XL || isInit) {
          if (!isInit) {
            offL_XL();
          }
          onS_M();
          isL_XL = false;
        }
      } else {
        if (!isL_XL || isInit) {
          if (!isInit) {
            offS_M();
          }
          onL_XL();
          isL_XL = true;
        }
      }
      isInit = false;
      return this;
    };

    init();
  });
}).call(this);

// ローカルナビの縦線の処理
$(function(){
    $('.nav-bar__nav-container ul li a').each(function(){
        if(!$(this).children('br').length){
            $(this).css({'line-height': '27px'});
        } else {      
        }
    });
    if (!$('.nav-bar__nav-container ul li.active').prev().hasClass('nav-bar__prefix')) {
        $('.nav-bar__nav-container ul li.active').prev().children('a').css({'border-right': '1px solid #005dab'});
    }
});

// ローカルナビ、第4階層調整
$(function(){
    if ($('.nav-bar__nav-container ul li').hasClass('nav-bar__prefix')) {
        $('.nav-bar__nav-container ul li:eq(1) a').css({'padding-left': '27px'});
    } else {
        if (!$('.nav-bar__nav-container ul li:eq(0)').hasClass('active')) {
            $('.nav-bar__nav-container ul li:eq(0) a').css({'border-left': '1px solid #4d94cb'});
        }
    }
});





(function ($) {

// デバイス
var device = {
  ua: navigator.userAgent,
  win: function (ver) {
    if (this.ua.indexOf('Windows') !== -1) {
      if (ver === undefined) {
        return true;
      } else {
        if ((ver === '8' && this.ua.indexOf('NT 6.2') !== -1) || (ver === '7' && this.ua.indexOf('NT 6.1') !== -1) || (ver === 'vista' && this.ua.indexOf('NT 6.0') !== -1) || (ver === 'xp' && this.ua.indexOf('NT 5.1') !== -1)) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  },

  mac: function () {
    if (this.ua.indexOf('Macintosh') !== -1) {
      return true;
    } else {
      return false;
    }
  },

  pc: function () {
    if (this.win() || this.mac()) {
      return true;
    } else {
      return false;
    }
  },

  ipad: function (ver) {
    if (this.ua.indexOf('iPad') !== -1) {
      if (ver === undefined) {
        return true;
      } else {
        var ver2 = ver.split('.').join('_');
        if (this.ua.indexOf('OS ' + ver2) !== -1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  },

  andtb: function (ver) {
    if (this.ua.indexOf('Android') !== -1 && this.ua.indexOf('Mobile') === -1) {
      if (ver === undefined) {
        return true;
      } else {
        if (this.ua.indexOf('Android ' + ver) !== -1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  },

  tb: function () {
    if (this.ipad() || this.andtb()) {
      return true;
    } else {
      return false;
    }
  },

  iphone: function (ver) {
    if (this.ua.indexOf('iPhone') !== -1) {
      if (ver === undefined) {
        return true;
      } else {
        var ver2 = ver.split('.').join('_');
        if (this.ua.indexOf('iPhone OS ' + ver2) !== -1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  },

  android: function (ver) {
    if (this.ua.indexOf('Android') !== -1 && this.ua.indexOf('Mobile') !== -1) {
      if (ver === undefined) {
        return true;
      } else {
        if (this.ua.indexOf('Android ' + ver) !== -1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  },

  sp: function () {
    if (this.iphone() || this.android()) {
      return true;
    } else {
      return false;
    }
  }
};

// ブラウザ
var browser = {
  ua: navigator.userAgent,
  ie: function (ver) {
    if (this.ua.indexOf('MSIE') !== -1) {
      if (ver === undefined) {
        return true;
      } else {
        if (this.ua.indexOf('MSIE ' + ver) !== -1) {
          return true;
        } else {
          return false;
        }
      }
    } else if (this.ua.indexOf('Trident') !== -1) {
      if (ver === undefined) {
        return true;
      } else {
        if (this.ua.indexOf('rv:' + ver) !== -1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  },

  ff: function () {
    if (this.ua.indexOf('Firefox') !== -1) {
      return true;
    } else {
      return false;
    }
  },

  safari: function () {
    if (this.ua.indexOf('Safari') !== -1 && this.ua.indexOf('Chrome') === -1) {
      return true;
    } else {
      return false;
    }
  },

  chrome: function () {
    if (this.ua.indexOf('Safari') !== -1 && this.ua.indexOf('Chrome') !== -1) {
      return true;
    } else {
      return false;
    }
  }
};

// 共通
var cmn = {
  orientation: window.orientation,
  resize: function (e) {
    if (
      (device.pc() && e.type === 'resize') ||
      ((device.ipad() || device.iphone()) && e.type === 'orientationchange') ||
      ((device.andtb() || device.android()) && e.type === 'resize' && Math.abs(window.orientation) !== Math.abs(cmn.orientation))
    ) {
      setTimeout(function () {
        cmn.orientation = window.orientation;
      }, 10);

      return true;
    } else {
      return false;
    }
  },

  scr: function () {
    if (browser.ie() || browser.ff()) {
      return 'html';
    } else {
      return 'body';
    }
  },

  winH: function () {
    if (browser.ie() || device.tb() || device.sp()) {
      return document.documentElement.clientHeight;
    } else {
      return window.innerHeight;
    }
  }
};

// イージング
$.extend($.easing, {
  jcbEoc: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },

  jcbEioc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
});

// Google マップ
function mapInit(id, lat, lng) {
  // 地図
  var center = new google.maps.LatLng(lat, lng);
  var map = new google.maps.Map(document.getElementById(id), {
    center: center,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    zoom: 16
  });

  // マーカー、吹き出し
  var marker = new google.maps.Marker({
    position: center,
    map: map
  });
}

// モーダル
$.fn.cmnModal = function(options) {
  function definition(el, setting) {
    setting.modal = $(setting.id).plainModal({
      overlay: {
        fillColor: '#000',
        opacity: 0.5
      },
      duration: 300,
      beforeopen: function () {
        if (!setting.opened) {
          setting.opened = true;
          overflowScroll($(setting.id + ' > .cmnModal'), false);
          $(setting.id + ' > .cmnModal .table3').each(function () {
            overflowScroll($(this), true);
          });

          if ($(setting.id + ' .modalGmap').length) {
            var num = Math.floor(Math.random() * 9999999999);
            var id = 'modalgmap_' + num;
            var lat = $(setting.id + ' .modalGmap').attr('data-lat');
            var lng = $(setting.id + ' .modalGmap').attr('data-lng');
            $(setting.id + ' .modalGmap').attr({ id: id });
            setTimeout(function () {
              mapInit(id, lat, lng);
            }, 100);
          }
        }
        adjust(el, setting);
      }
    });
  }

  function adjust(el, setting) {
    var winH = cmn.winH();
    $(setting.id + ' > .cmnModal').css({ maxHeight: winH - 20 });
  }

  function overflowScroll($target, horizontal) {
    function flick() {
      var scrL;
      var scrT;
      var startX;
      var startY;
      return function(e) {
        var touch = e.touches[0];
        if (e.type === 'touchstart') {
          scrL = $(this).scrollLeft();
          scrT = $(this).scrollTop();
          startX = touch.pageX;
          startY = touch.pageY;
        } else if (e.type === 'touchmove') {
          e.preventDefault();
          if (horizontal) {
            $(this).scrollLeft(scrL + (startX - touch.pageX));
          } else {
            $(this).scrollTop(scrT + (startY - touch.pageY));
          }
        }
      }
    }

    if (!device.pc()) {
      var trap = $target[0];
      var thTrap = flick();
      trap.addEventListener('touchstart', thTrap, false);
      trap.addEventListener('touchmove', thTrap, false);
      trap.addEventListener('touchend', thTrap, false);
    }
  }

  return this.each(function(i, el) {
    var defaults = {
      opened: false,
      href: $(el).attr('href'),
      id: ''
    };
    var setting = $.extend(defaults, options);

    $(el).on('click', function () {
      if (setting.href.charAt(0) === '#') {
        if (!setting.opened) {
          setting.id = setting.href;
          definition(el, setting);
        }
        setting.modal.plainModal('open');
      } else {
        if (!setting.opened) {
          $.ajax({
            url: setting.href,
            type: 'GET',
            dataType: 'html',
            cache: false,
            timeout: 10000,
            success: function (data) {
              var html = $(data).find('#htmlWrapper').html();
              var num = Math.floor(Math.random() * 9999999999);
              setting.id = '#modal_' + num;
              $('body').append('<div id="modal_' + num + '" class="cmnModalHtml">' + html + '</div>');
              definition(el, setting);
              setting.modal.plainModal('open');
            }
          });
        } else {
          setting.modal.plainModal('open');
        }
      }

      return false;
    });

    $(window).on('orientationchange resize', function (e) {
      if (cmn.resize(e)) {
        adjust(el, setting);
      }
    });
  });
};

// タブ
$.fn.tabSwitch = function(options) {
  function _switch(idx, el, setting) {
    setting.anim = true;
    $(el).find('.tabTrigger').eq(setting.cr).removeClass('current');
    $(el).find('.tabTrigger').eq(idx).addClass('current');

    $('#' + setting.target + ' > div').eq(setting.cr).fadeOut(setting.fadeDur, 'linear', function () {
      $('#' + setting.target + ' > div').eq(idx).fadeIn(setting.fadeDur, 'linear', function () {
        setting.cr = idx;
        setting.anim = false;
      });
    });
  }

  return this.each(function(i, el) {
    var defaults = {
      anim: false,
      cr: -1,
      target: '',
      fadeDur: 200
    };
    var setting = $.extend(defaults, options);
    
    var href = location.href;
    var start = href.indexOf('?') + 1;
    var params = href.slice(start).split('&');
    for (var j = 0; j < params.length; j++) {
      var param = params[j].split('=');
      if (param[0] === setting.target) {
        if (!isNaN(param[1])) {
          setting.cr = param[1] - 1;
          break;
        }

        break;
      }
    }
    
    $('#' + setting.target + ' > div').hide();

    if (setting.cr !== -1) {
      $(el).find('.tabTrigger').eq(setting.cr).addClass('current');
      $('#' + setting.target + ' > div:nth-child(' + (setting.cr + 1) + ')').show();
    }

    $(el).find('.tabTrigger').click(function() {
      var idx = $(el).find('.tabTrigger').index(this);
      if (!setting.anim && idx !== setting.cr) {
        _switch(idx, el, setting);
      }
    
      return false;
    });
  });
};

// アコーディオン
$.fn.blockSlide = function(options) {
  function show(el, setting) {
    setting.anim = true;
    $(el).addClass('open');
    $(el).find(setting.target).slideDown(setting.slideDur, setting.slideEase, function () {
      setting.anim = false;
    });
  }

  function hide(el, setting) {
    setting.anim = true;
    $(el).removeClass('open');
    $(el).find(setting.target).slideUp(setting.slideDur, setting.slideEase, function () {
      setting.anim = false;
    });
  }

  return this.each(function(i, el) {
    var defaults = {
      anim: false,
      slideDur: 400,
      slideEase: 'jcbEioc',
      target: '.setBody',
      trigger: '.setHead'
    };
    var setting = $.extend(defaults, options);
    
    if ($(el).hasClass('open')) {
      $(el).find(setting.target).show();
    } else {
      $(el).find(setting.target).hide();
    }

    $(el).find(setting.trigger).on('click', function () {
      if (!setting.anim) {
        if (!$(el).hasClass('open')) {
          show(el, setting);
        } else {
          hide(el, setting);
        }
      }

      return false;
    });
  });
};

// 共通カルーセル
$.fn.cmnCarousel = function(options) {
  function getSetHtml(el, num, left) {
    var html = '<div class="cmnCarouselSet" style="left: ' + left + 'px;" data-ghost="true">' + $(el).find('.cmnCarouselSet').eq(num).html() + '</div>';
    return html;
  }

  function ghostSet(el, setting) {
    var areaW = $(el).find('.cmnCarouselIn').width();
    var prepend = '';
    var append = '';

    // prepend
    if (setting.cr === 0) {
      var left = areaW * -2;
      prepend += getSetHtml(el, setting.mx - 2, left);
    }

    var left = areaW * -1;
    prepend += getSetHtml(el, setting.mx - 1, left);

    // append
    var left = areaW * setting.mx;
    append += getSetHtml(el, 0, left);

    if (setting.cr === setting.mx - 1) {
      var left = areaW * (setting.mx + 1);
      append += getSetHtml(el, 1, left);
    }

    $(el).find('.cmnCarouselIn2').prepend(prepend).append(append);
  }

  function adjust(el, setting) {
    var areaW = $(el).find('.cmnCarouselIn').width();
    var in3Left = areaW * setting.cr * -1;
    $(el).find('.cmnCarouselIn2').css({'left': in3Left});
    $(el).find('.cmnCarouselSet').each(function (j) {
      var num = (setting.cr === 0) ? j - 2 : j - 1;
      var left = areaW * num;
      $(this).css({'left': left});
    });
  }

  function timeCheck(el, setting) {
    clearTimeout(setting.timer);
    if (setting.anim) {
      setting.count = 0;
    } else {
      setting.timer = setTimeout(function () {
        setting.count++;
        if (setting.count >= setting.time / 100) {
          setting.count = 0;
          slide(el, setting, 1);
        } else {
          timeCheck(el, setting);
        }
      }, 100);
    }
  }

  function flick(el, setting) {
    var touchFlag = false;
    var startX = 0;
    var startY = 0;
    var startScrollY = 0;
    var diffX = 0;
    var diffY = 0;
    var sTime = 0;
    var left = 0;

    return function (e) {
      if (!setting.anim) {
        var touch = e.touches[0];
        if (e.type === 'touchstart') {
          touchFlag = true;
          startX = touch.pageX;
          startY = touch.pageY;
          diffX = 0;
          diffY = 0;
          startScrollY = document.body.scrollTop;
          sTime = (new Date()).getTime();
          left = eval($(el).find('.cmnCarouselIn2').css('left').replace('px', ''));
        } else if (e.type === 'touchmove') {
          if (touchFlag) {
            diffX = touch.pageX - startX;
            diffY = touch.pageY - startY;
            if (Math.abs(diffX) > Math.abs(diffY)) {
              e.preventDefault();
              if (startScrollY === document.body.scrollTop) {
                $(el).find('.cmnCarouselIn2').css({'left': left + diffX});
              }
            }
          }
        } else if (e.type === 'touchend') {
          if (touchFlag) {
            touchFlag = false;
            var t = (new Date()).getTime() - sTime;
            var winW = $(window).width();
            if (left != eval($(el).find('.cmnCarouselIn2').css('left').replace('px', ''))) {
              if (diffX > winW / 2 || (diffX > 20 && t < 500)) {
                slide(el, setting, -1);
              } else if (diffX < winW / 2 * -1 || (diffX < -20 && t < 500)) {
                slide(el, setting, 1);
              } else {
                slide(el, setting, 0);
              }
            }
          }
        }
      }
    };
  }

  function slide(el, setting, dir) {
    setting.anim = true;
    var next = setting.cr + dir;
    var areaW = $(el).find('.cmnCarouselIn').width();
    if (next === -1) { next = setting.mx - 1; }
    if (next === setting.mx) { next = 0; }
    $(el).find('.cmnCarouselPointerCr').removeClass('cmnCarouselPointerCr');
    $(el).find('.cmnCarouselPointer > span').eq(next).addClass('cmnCarouselPointerCr');

    if (setting.page) {
      $(el).find('.cmnCarouselPageCr').html(next + 1);
    }

    $(el).find('.cmnCarouselIn2').animate({ left: areaW * (setting.cr + dir) * -1 }, setting.slideDur, setting.slideEase, function () {
      setting.cr = next;
      setting.anim = false;
      $(el).find('[data-ghost="true"]').remove();
      ghostSet(el, setting);
      adjust(el, setting);
      if (setting.autoplay) {
        timeCheck(el, setting);
      }
    });
  }

  return this.each(function(i, el) {
    var defaults = {
      anim: false,
      arrow: false,
      autoplay: false,
      count: 0,
      cr: 0,
      mx: $(el).find('.cmnCarouselSet').length,
      page: false,
      pointer: false,
      slideDur: 500,
      slideEase: 'jcbEoc',
      time: 5000,
      timer: ''
    };
    var setting = $.extend(defaults, options);

    if (setting.mx >= 2) {
      if (setting.page) {
        var pageHtml = '<span class="cmnCarouselPageCr">1</span> / <span class="cmnCarouselPageMx">' + setting.mx + '</span>';
        $(el).find('.cmnCarouselPage').html(pageHtml);
      }

      if (setting.pointer) {
        var pointerHtml = '<span class="cmnCarouselPointerCr"></span>';
        for (var i = 1; i < setting.mx; i++) {
          pointerHtml += '<span></span>';
        }

        $(el).find('.cmnCarouselPointer').html(pointerHtml);

        $(el).find('.cmnCarouselPointer > span').on('click', function () {
          if (!setting.anim) {
            var idx = $(el).find('.cmnCarouselPointer > span').index(this);
            if (idx !== setting.cr) {
              slide(el, setting, idx - setting.cr);
            }
          }

          return false;
        });
      }

      if (setting.arrow) {
        var arrowHtml = '<span class="cmnCarouselArrowPrev"></span><span class="cmnCarouselArrowNext"></span>';
        $(el).find('.cmnCarouselArrow').html(arrowHtml);

        $(el).find('.cmnCarouselArrow > span').on('click', function () {
          if (!setting.anim) {
            var idx = $(el).find('.cmnCarouselArrow > span').index(this);
            if (idx === 0) {
              slide(el, setting, -1);
            } else if (idx === 1) {
              slide(el, setting, 1);
            }
          }

          return false;
        });
      }

      ghostSet(el, setting);
      adjust(el, setting);
      if (setting.autoplay) {
        timeCheck(el, setting);
      }
      $(window).on('orientationchange resize', function (e) {
        if (cmn.resize(e)) {
          clearTimeout(setting.timer);
          adjust(el, setting);
          if (setting.autoplay) {
            timeCheck(el, setting);
          }
        }
      });

      if (!device.pc()) {
        var trap = $(el)[0];
        var thTrap = flick(el, setting);
        trap.addEventListener('touchstart', thTrap, false);
        trap.addEventListener('touchmove', thTrap, false);
        trap.addEventListener('touchend', thTrap, false);
      }
    }
  });
};

// プロモーション一覧のソート機能
var prSortFunc = (function () {
  var props = {
    anim: false,
    fadeDur: 200,
    fadeEase: 'linear'
  };

  function init() {
    var firstReadList = $('#prListWrap > .prColBlock').html();
    $('#prListWrap > .prColBlock > .blockSet:nth-child(1)').addClass('row1');
    $('#prListWrap > .prColBlock > .blockSet:nth-child(2)').addClass('row2');
    $('#prListWrap > .prColBlock > .blockSet:nth-child(3)').addClass('row3');
    $('#prListWrap > .prColBlock > .blockSet:nth-child(3n+1)').addClass('colFirst');

    $('#prListWrap > .tabBlock > li > .in').on('click', function () {
      if (!props.anim && !$(this).hasClass('current') && !$(this).hasClass('disabled')) {
        props.anim = true;
        var idx = $('#prListWrap > .tabBlock > li > .in').index(this);
        var region = $(this).attr('data-region');
        $('#prListWrap > .tabBlock > li > .current').removeClass('current');
        $(this).addClass('current');
        $('#prListWrap > .prColBlock').fadeOut(props.fadeDur, props.fadeEase, function () {
          $('#prListWrap > .prColBlock > .blockSet').removeClass('row1 row2 row3 colFirst');
          if (region === 'all') {
            $('#prListWrap > .prColBlock').html(firstReadList);
            $('#prListWrap > .prColBlock > .blockSet:nth-child(1)').addClass('row1');
            $('#prListWrap > .prColBlock > .blockSet:nth-child(2)').addClass('row2');
            $('#prListWrap > .prColBlock > .blockSet:nth-child(3)').addClass('row3');
            $('#prListWrap > .prColBlock > .blockSet:nth-child(3n+1)').addClass('colFirst');
          } else {
            $('#prListWrap > .prColBlock > .blockSet[data-region="common"]').appendTo('#prListWrap > .prColBlock');
            $('#prListWrap > .prColBlock > .blockSet').hide();
            $('#prListWrap > .prColBlock > .blockSet[data-region="' + region + '"],.blockSet[data-region="common"]').show().each(function (i) {
              if (i === 0) {
                $(this).addClass('row1');
              }
              if (i === 1) {
                $(this).addClass('row2');
              }
              if (i === 2) {
                $(this).addClass('row3');
              }
              if (i % 3 === 0) {
                $(this).addClass('colFirst');
              }
            });
          }

          $('#prListWrap > .prColBlock').fadeIn(props.fadeDur, props.fadeEase, function () {
            props.anim = false;
          });
        });
      }
      return false;
    });
  }

  return {
    init: init,
  };
})();

$(function () {
  $('.cmnModalTrigger').cmnModal();
  $('.cardCompanyTab > ul').tabSwitch({ target: 'company' });
  $('.cardAccBlock > .blockSet, .cmnAccBlock > .blockSet').blockSlide();
  $('.keyVisual .cmnCarousel').cmnCarousel({ autoplay: true, pointer: true });
  $('.secureDemoBlock .cmnCarousel').cmnCarousel({ arrow: true, page: true });
  if ($('#prListWrap').length) { prSortFunc.init(); }
})

})(jQuery);
