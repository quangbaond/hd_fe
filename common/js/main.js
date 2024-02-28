(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

/*!
 * VERSION: 0.0.9
 * DATE: 2015-12-10
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
 * DrawSVGPlugin is a Club GreenSock membership benefit; You must have a valid membership to use
 * this code without violating the terms of use. Visit http://greensock.com/club/ to sign up or get more details.
 * This work is subject to the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope = typeof module !== "undefined" && module.exports && typeof global !== "undefined" ? global : undefined || window; //helps ensure compatibility with AMD/RequireJS and CommonJS/Node
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {

	"use strict";

	function getDistance(x1, y1, x2, y2) {
		x2 = parseFloat(x2) - parseFloat(x1);
		y2 = parseFloat(y2) - parseFloat(y1);
		return Math.sqrt(x2 * x2 + y2 * y2);
	}

	function unwrap(element) {
		if (typeof element === "string" || !element.nodeType) {
			element = _gsScope.TweenLite.selector(element);
			if (element.length) {
				element = element[0];
			}
		}
		return element;
	}

	//accepts values like "100%" or "20% 80%" or "20 50" and parses it into an absolute start and end position on the line/stroke based on its length. Returns an an array with the start and end values, like [0, 243]
	function parse(value, length, defaultStart) {
		var i = value.indexOf(" "),
		    s,
		    e;
		if (i === -1) {
			s = defaultStart !== undefined ? defaultStart + "" : value;
			e = value;
		} else {
			s = value.substr(0, i);
			e = value.substr(i + 1);
		}
		s = s.indexOf("%") !== -1 ? parseFloat(s) / 100 * length : parseFloat(s);
		e = e.indexOf("%") !== -1 ? parseFloat(e) / 100 * length : parseFloat(e);
		return s > e ? [e, s] : [s, e];
	}

	function getLength(element) {
		if (!element) {
			return 0;
		}
		element = unwrap(element);
		var type = element.tagName.toLowerCase(),
		    length,
		    bbox,
		    points,
		    point,
		    prevPoint,
		    i,
		    rx,
		    ry;
		if (type === "path") {
			//IE bug: calling getTotalLength() locks the repaint area of the stroke to whatever its current dimensions are on that frame/tick. To work around that, we must call getBBox() to force IE to recalculate things.
			prevPoint = element.style.strokeDasharray;
			element.style.strokeDasharray = "none";
			length = element.getTotalLength() || 0;
			try {
				bbox = element.getBBox(); //solely for fixing bug in IE - we don't actually use the bbox.
			} catch (e) {
				//firefox has a bug that throws an error if the element isn't visible.
			}
			element.style.strokeDasharray = prevPoint;
		} else if (type === "rect") {
			length = element.getAttribute("width") * 2 + element.getAttribute("height") * 2;
		} else if (type === "circle") {
			length = Math.PI * 2 * parseFloat(element.getAttribute("r"));
		} else if (type === "line") {
			length = getDistance(element.getAttribute("x1"), element.getAttribute("y1"), element.getAttribute("x2"), element.getAttribute("y2"));
		} else if (type === "polyline" || type === "polygon") {
			points = element.getAttribute("points").split(", ").join(",").split(" ");
			length = 0;
			prevPoint = points[0].split(",");
			if (points[points.length - 1] === "") {
				//if there's an extra space at the end, fix it.
				points.pop();
			}
			if (type === "polygon") {
				points.push(points[0]);
				if (points[0].indexOf(",") === -1) {
					points.push(points[1]);
				}
			}
			for (i = 1; i < points.length; i++) {
				point = points[i].split(",");
				if (point.length === 1) {
					point[1] = points[i++];
				}
				if (point.length === 2) {
					length += getDistance(prevPoint[0], prevPoint[1], point[0], point[1]) || 0;
					prevPoint = point;
				}
			}
		} else if (type === "ellipse") {
			rx = parseFloat(element.getAttribute("rx"));
			ry = parseFloat(element.getAttribute("ry"));
			length = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
		}
		return length || 0;
	}

	var _getComputedStyle = document.defaultView ? document.defaultView.getComputedStyle : function () {},
	    DrawSVGPlugin;

	function getPosition(element, length) {
		if (!element) {
			return [0, 0];
		}
		element = unwrap(element);
		length = length || getLength(element) + 1;
		var cs = _getComputedStyle(element),
		    dash = cs.strokeDasharray || "",
		    offset = parseFloat(cs.strokeDashoffset),
		    i = dash.indexOf(",");
		if (i < 0) {
			i = dash.indexOf(" ");
		}
		dash = i < 0 ? length : parseFloat(dash.substr(0, i)) || 0.00001;
		if (dash > length) {
			dash = length;
		}
		return [Math.max(0, -offset), Math.max(0, dash - offset)];
	}

	DrawSVGPlugin = _gsScope._gsDefine.plugin({
		propName: "drawSVG",
		API: 2,
		version: "0.0.9",
		global: true,
		overwriteProps: ["drawSVG"],

		init: function init(target, value, tween) {
			if (!target.getBBox) {
				return false;
			}
			var length = getLength(target) + 1,
			    start,
			    end,
			    overage;
			this._style = target.style;
			if (value === true || value === "true") {
				value = "0 100%";
			} else if (!value) {
				value = "0 0";
			} else if ((value + "").indexOf(" ") === -1) {
				value = "0 " + value;
			}
			start = getPosition(target, length);
			end = parse(value, length, start[0]);
			this._length = length + 10;
			if (start[0] === 0 && end[0] === 0) {
				overage = Math.max(0.00001, end[1] - length); //allow people to go past the end, like values of 105% because for some paths, Firefox doesn't return an accurate getTotalLength(), so it could end up coming up short.
				this._dash = length + overage;
				this._offset = length - start[1] + overage;
				this._addTween(this, "_offset", this._offset, length - end[1] + overage, "drawSVG");
			} else {
				this._dash = start[1] - start[0] || 0.000001; //some browsers render artifacts if dash is 0, so we use a very small number in that case.
				this._offset = -start[0];
				this._addTween(this, "_dash", this._dash, end[1] - end[0] || 0.00001, "drawSVG");
				this._addTween(this, "_offset", this._offset, -end[0], "drawSVG");
			}
			return true;
		},

		//called each time the values should be updated, and the ratio gets passed as the only parameter (typically it's a value between 0 and 1, but it can exceed those when using an ease like Elastic.easeOut or Back.easeOut, etc.)
		set: function set(ratio) {
			if (this._firstPT) {
				this._super.setRatio.call(this, ratio);
				this._style.strokeDashoffset = this._offset;
				if (ratio === 1 || ratio === 0) {
					this._style.strokeDasharray = this._offset < 0.001 && this._length - this._dash <= 10 ? "none" : this._offset === this._dash ? "0px, 999999px" : this._dash + "px," + this._length + "px";
				} else {
					this._style.strokeDasharray = this._dash + "px," + this._length + "px";
				}
			}
		}

	});

	DrawSVGPlugin.getLength = getLength;
	DrawSVGPlugin.getPosition = getPosition;
});if (_gsScope._gsDefine) {
	_gsScope._gsQueue.pop()();
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function isInt(value) {
  if (parseFloat(value) == parseInt(value) && !isNaN(value)) {
    return true;
  }

  return false;
}

var Accordion = function () {
  function Accordion(el, options) {
    var _this = this;

    _classCallCheck(this, Accordion);

    this.$jqo = $(el);
    this.options = options;
    this.panels = this.$jqo.find(this.options.panels);
    this.triggers = this.$jqo.find(this.options.triggers);
    this.duration = this.options.duration;

    this.setup();

    this.triggers.on('click', function (e) {
        if(!$(this).parent("li").hasClass("no-dropdown") ){
          e.preventDefault();
          var panel = $(e.target).parent();
          _this.toggle(panel);
            }
    });
  }

  Accordion.prototype.destroy = function destroy() {
    this.close();
    this.triggers.off('click');
    this.panels.height('auto');
    this.$jqo.height('auto');
    this.$jqo.data('accordion', false);
  };

  Accordion.prototype.setup = function setup() {
    var top = 0;
    this.panels.each(function (i, el) {
      TweenLite.set(el, { top: top });
      top += el.offsetHeight;
    });

    this.$jqo.height(top);
  };

  Accordion.prototype.getPanelChildren = function getPanelChildren(panel) {
    var $panel = $(panel);
    var $trigger = $panel.children().first();
    var $target = $trigger.next();

    return {
      trigger: $trigger,
      target: $target
    };
  };

  Accordion.prototype.getPanelChildrenHeights = function getPanelChildrenHeights(panel) {
    var _getPanelChildren = this.getPanelChildren(panel);

    var trigger = _getPanelChildren.trigger;
    var target = _getPanelChildren.target;

    return {
      triggerHeight: trigger.outerHeight(),
      targetHeight: target.length ? target.outerHeight() : 0
    };
  };

  Accordion.prototype.getPanelStartingHeight = function getPanelStartingHeight(panel) {
    var _getPanelChildrenHeig = this.getPanelChildrenHeights(panel);

    var triggerHeight = _getPanelChildrenHeig.triggerHeight;
    var targetHeight = _getPanelChildrenHeig.targetHeight;

    return triggerHeight + targetHeight;
  };

  Accordion.prototype.getTriggerOffset = function getTriggerOffset(panel) {
    var _getPanelChildren2 = this.getPanelChildren(panel);

    var trigger = _getPanelChildren2.trigger;

    return trigger.position().top;
  };

  Accordion.prototype.getContentStartingPos = function getContentStartingPos(panel) {
    var _getPanelChildrenHeig2 = this.getPanelChildrenHeights(panel);

    var triggerHeight = _getPanelChildrenHeig2.triggerHeight;
    var targetHeight = _getPanelChildrenHeig2.targetHeight;

    var bottom = this.getTriggerOffset(panel) + triggerHeight;
    return bottom - targetHeight;
  };

  Accordion.prototype.setPanelStartingPos = function setPanelStartingPos(panel) {
    var target = this.getPanelChildren(panel).target;
    TweenLite.set(panel, {
      height: this.getPanelStartingHeight(panel)
    });

    TweenLite.set(target, {
      top: this.getContentStartingPos(panel)
    });
  };

  Accordion.prototype.move = function move(el, close, cb) {
    var panel = this.panelOrInt(el);
    var target = this.getPanelChildren(panel).target;
    var height = this.getPanelChildrenHeights(panel).targetHeight;

    if (close) {
      height = 0;
    }

    TweenLite.to(target, this.options.duration, { y: height });
    TweenLite.to(panel.nextAll(), this.options.duration, { y: height });
    TweenLite.to(panel.prevAll().addBack(), this.options.duration, {
      y: 0,
      onComplete: cb || $.noop
    });
  };

  Accordion.prototype.open = function open(el) {
    var panel = this.panelOrInt(el);
    var active = this.active;

    this.panels.removeClass('active');
    panel.addClass('active');

    this.setPanelStartingPos(panel);
    this.move(panel, false, function () {
      if (active) {
        TweenLite.set(active, { height: '' });
      }
    });

    return this.active = panel;
  };

  Accordion.prototype.close = function close() {
    if (!this.active) return;

    this.active.removeClass('active');
    this.move(this.active, true);
    this.active = null;
  };

  Accordion.prototype.panelOrInt = function panelOrInt(panel) {
    var el = panel;
    if (isInt(panel)) {
      el = this.panels.eq(panel);
    }
    return $(panel);
  };

  Accordion.prototype.toggle = function toggle(panel) {
    var $panel = this.panelOrInt(panel);
    if (this.active && this.active.is($panel)) {
      this.close();
    } else {
      this.open($panel);
    }
  };

  return Accordion;
}();

$.fn.accordion = function (options) {
  var args = $.makeArray(arguments);
  var after = args.slice(1);

  return this.each(function () {
    var instance = undefined,
        $el = $(this);

    instance = $el.data('accordion');

    if (instance) {
      instance[args[0]].apply(instance, after);
    } else {
      if (args[0] !== 'destroy') {
        var opts = $.extend({
          triggers: '.accordion__trigger',
          panels: '.accordion__panel',
          content: '.accordion__content',
          duration: .3,
          offset: 0
        }, options);
        $el.data('accordion', new Accordion($el, opts));
      }
    }
  });
};

},{}],3:[function(require,module,exports){
'use strict';

require('./accordion');

require('./close');

require('./nav-bar');

require('./DrawSVGPlugin.js');

require('./dropdown.js');

require('./what-we-do/01_intro');

require('./what-we-do/01.5_slide1');

require('./what-we-do/01.6_slide2');

require('./what-we-do/02_circles');

require('./what-we-do/03_special_offers');

require('./what-we-do/04_international_alliances');

require('./what-we-do/05_assist');

require('./what-we-do/06_trip');

require('./what-we-do/07_tourists');

require('./what-we-do/07.5_travel');

require('./what-we-do/08_growth');

require('./what-we-do/09_security');

$(document).ready(function () {
  FastClick.attach(document.body);

  $('.carousel').each(function () {
    var len = $(this).children().length;
    $(this).addClass('carouselNum' + len);
    
    if (len === 1) {
      $(this).slick({
        arrows: false,
        dots: true,
        infinite: false,
        initialSlide: 0,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1
      });
    } else if (len === 2) {
      $(this).slick({
        arrows: false,
        dots: true,
        infinite: false,
        initialSlide: 0,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 2,
        responsive: [{
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }]
      });
    } else if (len === 3) {
      $(this).slick({
        arrows: false,
        dots: true,
        infinite: false,
        initialSlide: 0,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [{
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }, {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }]
      });
    } else {
      $(this).slick({
        arrows: false,
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [{
          breakpoint: 930,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        }, {
          breakpoint: 767,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }, {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }]
      });
    }
  });

  $('.accordion').each(function () {
    var $el = $(this);
    var $wrap = $el.find('.accordion__padding');

    $wrap.css({
      position: 'absolute', // Optional if #myDiv is already absolute
      visibility: 'hidden',
      display: 'block'
    });

    var height = $wrap.outerHeight();
    $wrap.attr('style', '');

    var $content = $el.find('.accordion__content');

    if ($el.hasClass('accordion--open')) {
      $content.css({ height: height });
    } else {
      $content.css({ height: 0 });
    }

    $el.find('.accordion__trigger').on('click', function (e) {
      e.preventDefault();

      if ($el.hasClass('accordion--open')) {
        $content.animate({ height: 0 }, 500, function () {
          $el.removeClass('accordion--open');
        });
      } else {
        $content.animate({ height: height }, 500, function () {
          $el.addClass('accordion--open');
        });
      }
    });
  });

  var createNav = function createNav() {
    $('.responsive-list').accordion({
      panels: '> li',
      triggers: '> li > a',
      content: '> li > ul'
    });
  };

  $('.nav-bar').navbar();
  $('.emergency-banner__close').each(function () {
    var target = $(this).parents('.emergency-banner');
    $(this).close({
      target: target
    });
  });
  $('[data-dropdown-content]').dropdown();

  var $window = $(window);
  if (window.matchMedia('(max-width:767px)').matches) {
    createNav();
  }

  $window.on('resize', function (e) {
    if (window.matchMedia('(min-width:768px)').matches) {
      $('.responsive-list').accordion('destroy');
    } else {
      var data = $('.responsive-list').data('accordion');
      if (!data) {
        createNav();
      }
    }
    if(!$('.site-header .menu').hasClass('menu--open')){
      $('#primary-navigation').height('');
    }
    if($('.menu').css('display') == 'table'){
      $('#primary-navigation > li > ul').css({"top": "", "transform": ""});
    }
  });

  var recalc_pri_nav_height = function(){
    var $pri_nav = $("#primary-navigation");
    if($('.site-header .menu').hasClass("menu--open")){
      var $navs = $pri_nav.find(">li");
      var sum_height = 0;

      $navs.each(function(){
        var $this = $(this);
        if($this.hasClass("hide-small")) return;
        var height = $this.hasClass("active") ? $this.innerHeight() : $this.find(">a").innerHeight();
        sum_height += height;
      });

      $pri_nav.stop(false, false).animate({"height": sum_height + "px"}, { duration: 'fast', easing: 'swing' });
    }
  };

  $('.hamburger').on('click', function (e) {
    e.preventDefault();
    var $trigger = $(this);
    $trigger.toggleClass('hamburger--open');
    $trigger.closest('.menu').toggleClass('menu--open');
    $('.responsive-list').accordion('close');

    // init nav wrapper height
    if(!$trigger.hasClass('hamburger--open')){
      $('#primary-navigation').height('');
    }
    if($trigger.closest('.menu').hasClass('menu--open')){
      $('#primary-navigation').height('');
    }
    // set nav wrapper height
    recalc_pri_nav_height();
  });

  $(document).on('click', '#primary-navigation > li > a', function(){
    recalc_pri_nav_height();
  });

  $('.search-form-container').on('click', function () {
    $('#primary-navigation').addClass('search-open');
    $('#search-form__input').focus();
  });

  $('#search-form__input').on('blur', function () {
    $('#primary-navigation').removeClass('search-open');
  });

  // reset menu height
 $('#primary-navigation').height('')
 // clear menu background when iphone browser
 if(window.navigator.userAgent.toLowerCase().indexOf("iphone") != -1)
   $('#primary-navigation').css({'filter': 'none', 'background': 'transparent'});

});

},{"./DrawSVGPlugin.js":1,"./accordion":2,"./close":4,"./dropdown.js":5,"./nav-bar":6,"./what-we-do/01.5_slide1":7,"./what-we-do/01.6_slide2":8,"./what-we-do/01_intro":9,"./what-we-do/02_circles":10,"./what-we-do/03_special_offers":11,"./what-we-do/04_international_alliances":12,"./what-we-do/05_assist":13,"./what-we-do/06_trip":14,"./what-we-do/07.5_travel":15,"./what-we-do/07_tourists":16,"./what-we-do/08_growth":17,"./what-we-do/09_security":18}],4:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Close = function () {
  function Close(el, options) {
    var _this = this;

    _classCallCheck(this, Close);

    this.$jqo = $(el);
    this.options = options;

    this.target = $(this.options.target || this.$jqo.attr('rel') || this.$jqo.parent());

    this.$jqo.on('click', function () {
      _this.target.animate({
        opacity: 0
      }, 400, function () {
        _this.destroy();
        _this.target.hide();
      });
    });
  }

  Close.prototype.destroy = function destroy() {
    this.$jqo.off('click');
    this.$jqo.data('close', false);
  };

  return Close;
}();

$.fn.close = function (options) {
  var args = $.makeArray(arguments);
  var after = args.slice(1);

  return this.each(function () {
    var instance = undefined,
        $el = $(this);

    instance = $el.data('close');

    if (instance) {
      instance[args[0]].apply(instance, after);
    } else {
      if (args[0] !== 'destroy') {
        var opts = $.extend({
          target: false
        }, options);
        $el.data('close', new Close($el, opts));
      }
    }
  });
};

},{}],5:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dropdown = function () {
  function Dropdown(el, options) {
    var _this = this;

    _classCallCheck(this, Dropdown);

    this.$jqo = $(el);
    this.options = options;
    this.open = this.options.open;

    this.target = $(this.options.target || this.$jqo.data('dropdown-content') || this.$jqo.find(':last-child'));

    this.$jqo.on('click', function (e) {
      return _this._handle(e);
    });
  }

  Dropdown.prototype._handle = function _handle(e) {
    e.preventDefault();
    this.toggle();
  };

  Dropdown.prototype.destroy = function destroy() {
    this.$jqo.off('click', this._handle);
    this.$jqo.data('dropdown', false);
  };

  Dropdown.prototype.toggle = function toggle() {
    var _this2 = this;

    this.target.toggleClass(this.options.openClass, function () {
      if (_this2.open) {
        return _this2.open = false;
      }

      return _this2.open = true;
    });
  };

  return Dropdown;
}();

$.fn.dropdown = function (options) {
  var args = $.makeArray(arguments);
  var after = args.slice(1);

  return this.each(function () {
    var instance = undefined,
        $el = $(this);

    instance = $el.data('dropdown');

    if (instance) {
      instance[args[0]].apply(instance, after);
    } else {
      if (args[0] !== 'destroy') {
        var opts = $.extend({
          open: false,
          openClass: 'dropdown__content--open'
        }, options);

        $el.data('dropdown', new Dropdown($el, opts));
      }
    }
  });
};

},{}],6:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Navbar = function () {
  function Navbar(el, options) {
    var _this = this;

    _classCallCheck(this, Navbar);

    this.$jqo = $(el);
    this.options = options;
    this.scroller = this.$jqo.find(this.options.scroller);
    this.target = this.$jqo.find(this.options.target);

    setTimeout(function () {
      var position = _this.target.position().left + _this.options.offset;
      _this.scroller.animate({
        scrollLeft: position
      });
    }, 1000);
  }

  Navbar.prototype.destroy = function destroy() {
    this.$jqo.data('navbar', false);
  };

  return Navbar;
}();

$.fn.navbar = function (options) {
  var args = $.makeArray(arguments);
  var after = args.slice(1);

  return this.each(function () {
    var instance = undefined,
        $el = $(this);

    instance = $el.data('navbar');

    if (instance) {
      instance[args[0]].apply(instance, after);
    } else {
      if (args[0] !== 'destroy') {
        var opts = $.extend({
          scroller: '.nav-bar__nav-container',
          target: '.active',
          offset: -10
        }, options);
        $el.data('navbar', new Navbar($el, opts));
      }
    }
  });
};

},{}],7:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {

  if (!$('#wwd-intro').length) return;

  var Scene01_5 = function (_Scene) {
    _inherits(Scene01_5, _Scene);

    function Scene01_5() {
      _classCallCheck(this, Scene01_5);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene01_5.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var content1 = $('#wwd-slide-1__content');

      this.elements.push(parent, content1);

      return new TimelineMax().to(content1, .5, { opacity: 1, y: 0 }, '+=1');
    };

    return Scene01_5;
  }(_scene2.default);

  if (!Modernizr.touch) {
    (function () {
      var checkScreen = function checkScreen() {
        scene01_5.resetScene();
        if (scene01_5.$window.width() < 768) return;

        scene01_5.setupScene();
      };

      var scene01_5 = new Scene01_5('#wwd-slide-1', '.scene-panel', { duration: '200%' });
      scene01_5.$window.on('resize', checkScreen);

      checkScreen();
    })();
  }
});

},{"./scene":19}],8:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {

  if (!$('#wwd-intro').length) return;

  var Scene01_6 = function (_Scene) {
    _inherits(Scene01_6, _Scene);

    function Scene01_6() {
      _classCallCheck(this, Scene01_6);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene01_6.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var content2 = $('#wwd-slide-2__content');

      this.elements.push(parent, content2);

      return new TimelineMax().to(content2, .5, { opacity: 1, y: 0 }, '+=1');
    };

    return Scene01_6;
  }(_scene2.default);

  if (!Modernizr.touch) {
    (function () {
      var checkScreen = function checkScreen() {
        scene01_6.resetScene();
        if (scene01_6.$window.width() < 768) return;

        scene01_6.setupScene();
      };

      var scene01_6 = new Scene01_6('#wwd-slide-2', '.scene-panel', { duration: '200%' });
      scene01_6.$window.on('resize', checkScreen);

      checkScreen();
    })();
  }
});

},{"./scene":19}],9:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

$(document).ready(function () {

  var $header = $('#wwd__header');
  var prevTop = $(window).scrollTop();

  $(window).on('scroll', function (e) {
    var st = $(this).scrollTop();
    if (st > prevTop) {
      $header.addClass('wwd--scrolling');
    } else {
      $header.removeClass('wwd--scrolling');
    }
    prevTop = st;
  });

  if (!$('#wwd-intro').length) return;

  if ($(window).width() >= 768) {
    $('html body').css({ overflow: 'hidden' });
  }

  new TimelineMax({
    onComplete: function onComplete() {
      $('html body').css({ overflow: 'auto' });
    }
  }).to('#wwd-intro__pre-header', 1.1, { y: '-50%', opacity: 1, ease: Linear.easeNone }).to('#wwd-intro__background', 1.1, { opacity: 1, scale: 1, ease: Linear.easeNone }, '-=1.1').to('#wwd__header', 1.1, { opacity: 1, ease: Linear.easeNone }, '-=1.1').to('#wwd-intro__pre-header', 1, { opacity: 0, ease: Linear.easeNone }).to('#wwd-intro__logo', 1, { opacity: 1, y: 0, ease: Linear.easeNone }, '+=0.5').to('#wwd-intro__header', 1, { opacity: 1, y: 0, ease: Linear.easeNone }, '-=1').to('#wwd-intro__scroll-icon', .7, { opacity: 1, scale: 1, ease: Linear.easeNone }).to('#wwd-intro__scroll-icon', .4, { scale: .9, repeat: 3, yoyo: true, ease: Linear.easeNone });

  $(window).on('beforeunload', function () {
    $('html body').scrollTop(0);
  });
});

},{"./scene":19}],10:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-circles').length || Modernizr.touch) return;

  var Scene02 = function (_Scene) {
    _inherits(Scene02, _Scene);

    function Scene02() {
      _classCallCheck(this, Scene02);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene02.prototype.setupScene = function setupScene() {
      this.childrenTimelines.push(this.introTimeline());
      this.masterTimeline = this.getTimeline(3.5);
      this.scene = this.addMagic();
    };

    Scene02.prototype.introTimeline = function introTimeline() {
      var header = $('#wwd-circles__pre-header');
      this.elements.push(header);
      return new TimelineMax().to(header, 1, { y: '-50%', opacity: 1, ease: Linear.easeNone }).to(header, 2, { opacity: 1 }).to(header, 1, { y: '-75%', opacity: 0, ease: Linear.easeNone });
    };

    Scene02.prototype.getScaleRatio = function getScaleRatio() {
      var height = this.$window.height();
      return (this.$window.width() + height) / height;
    };

    Scene02.prototype.getChildTimeline = function getChildTimeline(element) {
      var ratio = this.getScaleRatio();
      var parent = $(element);
      var circle = $('#' + parent.data('circle'));
      var text = parent.find('.wwd-circle__text');
      var statCounter = { var: text.data('start') };
      this.elements.push(parent, circle, text, statCounter);

      return new TimelineMax().to(parent, 1, { opacity: 1 }).add('circle').fromTo(circle, 1, { scale: 0, ease: Linear.easeNone }, { scale: .95 }, '-=1').add('circleStop').to(circle, 2.5, { scale: 1, ease: Linear.easeNone }).set(circle, { transformOrigin: '50% 50%' }).to(statCounter, 2, { var: text.data('end'), ease: Linear.easeNone, onUpdate: function onUpdate() {
          $(text).text(Math.ceil(statCounter.var));
        } }, 'circle-=1').to(circle, 1, { scale: ratio, ease: Linear.easeNone }).to(parent, .5, { opacity: 0 }, '-=1.2');
    };

    return Scene02;
  }(_scene2.default);

  var scene02 = new Scene02('#wwd-circles', '.wwd-circle__stats', { duration: '500%', pushFollowers: true });
  scene02.$window.on('resize', checkScreen);

  function checkScreen() {
    scene02.resetScene();
    if (scene02.$window.width() < 768) return;

    scene02.setupScene();
    scene02.addToChild(1, new TimelineMax().from('#circle-1-icon__path-1', .75, { drawSVG: 0 }).from('#circle-1-icon__path-2', .75, { drawSVG: '100% 100%' }, '-=.25').from('#circle-1-icon__line-1', .5, { scale: 0 }).from('#circle-1-icon__line-2', .5, { scale: 0 }).from('#circle-1-icon__line-3', .5, { scale: 0 }), 'circleStop-=.5');

    scene02.addToChild(2, new TimelineMax().from('#circle-2-icon__circle', 1, { drawSVG: 0 }).from('#circle-2-icon__path', 1, { drawSVG: 0 }, '-=.5').from('#circle-2-icon__line', 1, { drawSVG: '100% 100%' }, '-=.5'), 'circleStop-=.25');

    scene02.addToChild(3, new TimelineMax().from('#circle-3-icon__circle', 1, { drawSVG: 0 }).from('#circle-3-icon__line-1', .7, { drawSVG: '100% 100%' }, '-=.5').from('#circle-3-icon__line-2', .7, { drawSVG: 0 }, '-=.5').from('#circle-3-icon__line-3', .7, { drawSVG: 0 }, '-=.5').from('#circle-3-icon__line-4', .7, { drawSVG: '100% 100%' }, '-=.5').from('#circle-3-icon__path-1', .7, { drawSVG: 0 }, '-=.5').from('#circle-3-icon__path-2', .7, { drawSVG: 0 }, '-=.5'), 'circleStop-=.25');

    scene02.addToChild(4, new TimelineMax().from('#circle-4-icon__circle', 1, { drawSVG: 0 }).from('#circle-4-icon__line-1', .5, { drawSVG: 0 }, '-=.25').from('#circle-4-icon__line-2', .5, { drawSVG: 0 }, '-=.25').from('#circle-4-icon__line-3', .5, { drawSVG: 0 }, '-=.25').from('#circle-4-icon__path', 1, { drawSVG: 0 }, '-=.25'), 'circleStop-=.25');
  };

  checkScreen();
});

},{"./scene":19}],11:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-special-offers').length || Modernizr.touch) return;

  var Scene03 = function (_Scene) {
    _inherits(Scene03, _Scene);

    function Scene03() {
      _classCallCheck(this, Scene03);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene03.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var heading = parent.find('.wwd-special-offers__heading');
      var content = parent.find('.wwd-special-offers__content');
      this.elements.push(parent, heading, content);

      return new TimelineMax().to(parent, 1, { opacity: 1 }).to(heading, 1, { opacity: 1 }, '-=.5').to(content, 1, { opacity: 1 }, '-=1');
    };

    return Scene03;
  }(_scene2.default);

  var scene03 = new Scene03('#wwd-special-offers', '.scene-panel', { duration: "100%", pushFollowers: false });
  scene03.$window.on('resize', checkScreen);

  function checkScreen() {
    scene03.resetScene();
    if (scene03.$window.width() < 768) return;

    scene03.setupScene();
  };

  checkScreen();
});

},{"./scene":19}],12:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-international-alliances').length || Modernizr.touch) return;

  var Scene04 = function (_Scene) {
    _inherits(Scene04, _Scene);

    function Scene04() {
      _classCallCheck(this, Scene04);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene04.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var container = parent.find('.wwd-international-alliances__container');
      var heading = parent.find('.wwd-international-alliances__heading');
      var content = parent.find('.wwd-international-alliances__content');
      var cards = parent.find('.wwd-international-alliances__card-cell');
      this.elements.push(parent, container, heading, content, cards);
      return new TimelineMax().to(container, 4, { opacity: .3 }).to(container, 1, { opacity: 1 }).to(heading, 1, { opacity: 1, y: 0 }).staggerTo(cards, .5, { opacity: 1, y: 0 }, .1).to(content, 1, { opacity: 1, y: 0 });
    };

    return Scene04;
  }(_scene2.default);

  var scene04 = new Scene04('#wwd-international-alliances', '.scene-panel', { duration: "200%", pushFollowers: false });
  scene04.$window.on('resize', checkScreen);

  function checkScreen() {
    scene04.resetScene();
    if (scene04.$window.width() < 768) return;

    scene04.setupScene();

    scene04.scene.on("enter", function (event) {
      TweenLite.set(scene04.parents, { opacity: 1 });
    });

    scene04.scene.on("leave", function (event) {
      if (event.scrollDirection === "REVERSE") {
        TweenLite.set(scene04.parents, { opacity: 0 });
      }
    });
  };

  checkScreen();
});

},{"./scene":19}],13:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-assist').length || Modernizr.touch) return;

  var Scene05 = function (_Scene) {
    _inherits(Scene05, _Scene);

    function Scene05() {
      _classCallCheck(this, Scene05);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene05.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var heading = parent.find('.wwd-assist__heading-container');
      var subheading = parent.find('.wwd-assist__subheading');
      var content = parent.find('.wwd-assist__content');
      var cards = parent.find('li');
      this.elements.push(parent, heading, subheading, content, cards);

      return new TimelineMax().to(heading, 4, { opacity: 0 }).to(heading, 1, { opacity: 1, y: 0 }).to(subheading, 1, { opacity: 1, y: 0 }, '-=1').to(content, 1, { opacity: 1, y: 0 }, '-=1').staggerFrom(cards, .5, { opacity: 0, scale: 0 }, .1);
    };

    return Scene05;
  }(_scene2.default);

  var scene05 = new Scene05('#wwd-assist', '.scene-panel', { duration: "200%", pushFollowers: true });
  scene05.$window.on('resize', checkScreen);

  function checkScreen() {
    scene05.resetScene();
    TweenMax.set('.wwd-assist__button', { clearProps: 'all' });
    if (scene05.$window.width() < 768) return;

    scene05.setupScene();

    new ScrollMagic.Scene({
      triggerElement: '.wwd-assist__button_trigger',
      triggerHook: 'onLeave',
      duration: '100%'
    }).setTween(new TimelineMax().to('.wwd-assist__button', .25, { opacity: 1 }).to('.wwd-assist__button', 1, { y: '-25%' }, '-=.25')).addTo(scene05.controller);
  };

  checkScreen();
});

},{"./scene":19}],14:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-trip').length || Modernizr.touch) return;

  var Scene06 = function (_Scene) {
    _inherits(Scene06, _Scene);

    function Scene06() {
      _classCallCheck(this, Scene06);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene06.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var heading = parent.find('.wwd-trip__heading');
      var content = parent.find('.wwd-trip__content');
      var card = parent.find('.wwd-trip__card');
      var phone = parent.find('.wwd-trip__phone');
      var icons = parent.find('li');
      this.elements.push(parent, heading, content, card, phone, icons);

      return new TimelineMax().to(card, 2, { y: "-=120" }).to(heading, 1, { opacity: 1 }).to(content, 1, { opacity: 1 }, '-=1').to(phone, 1, { opacity: 1 }, '-=1').staggerFrom(icons, .25, { scale: 0 }, .1);
    };

    return Scene06;
  }(_scene2.default);

  var scene06 = new Scene06('#wwd-trip', '.wwd-trip__panel', { triggerHook: 'onEnter', duration: $('#wwd-trip').height(), pin: false });
  scene06.$window.on('resize', checkScreen);

  function checkScreen() {
    scene06.resetScene();
    TweenMax.set('#wwd-trip__button', { clearProps: 'all' });
    if (scene06.$window.width() < 768) return;

    scene06.setupScene();

    new ScrollMagic.Scene({
      triggerElement: '#wwd-trip__button-trigger',
      triggerHook: 'onLeave',
      duration: '100%'
    }).setTween(new TimelineMax().to('#wwd-trip__button', .25, { opacity: 1 }).to('#wwd-trip__button', 1, { y: '-25%' }, '-=.25')).addTo(scene06.controller);
  };

  checkScreen();
});

},{"./scene":19}],15:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-travel').length || Modernizr.touch) return;

  var Scene07_5 = function (_Scene) {
    _inherits(Scene07_5, _Scene);

    function Scene07_5() {
      _classCallCheck(this, Scene07_5);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene07_5.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var heading = parent.find('.wwd-travel__heading-container');
      var content = parent.find('.wwd-travel__content');
      this.elements.push(parent, heading, content);

      return new TimelineMax().to(heading, 2, { opacity: 0 }).to(heading, 1, { opacity: 1, y: 0 }).to(content, 1, { opacity: 1, y: 0 }, '-=1');
    };

    return Scene07_5;
  }(_scene2.default);

  var scene07_5 = new Scene07_5('#wwd-travel', '.scene-panel', { duration: "300%", pushFollowers: true });
  scene07_5.$window.on('resize', checkScreen);

  function checkScreen() {
    scene07_5.resetScene();
    TweenMax.set('.wwd-travel__button', { clearProps: 'all' });
    if (scene07_5.$window.width() < 768) return;

    scene07_5.setupScene();

    new ScrollMagic.Scene({
      triggerElement: '.wwd-travel__button_trigger',
      triggerHook: 'onLeave',
      duration: '100%'
    }).setTween(new TimelineMax().to('.wwd-travel__button', .25, { opacity: 1 }).to('.wwd-travel__button', 1, { y: '-25%' }, '-=.25')).addTo(scene07_5.controller);
  };

  checkScreen();
});

},{"./scene":19}],16:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-tourists').length || Modernizr.touch) return;

  var Scene07 = function (_Scene) {
    _inherits(Scene07, _Scene);

    function Scene07() {
      _classCallCheck(this, Scene07);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene07.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var mask = parent.find('.wwd__mask');
      var heading = parent.find('.wwd-tourists__heading');
      var content = parent.find('.wwd-tourists__content');
      var promotions = parent.find('li');
      var button = parent.find('.wwd__split-button');
      this.elements.push(parent, mask, heading, content, promotions, button);

      return new TimelineMax().to(mask, 2, { opacity: 0 }).to(mask, 1, { opacity: .9 }).to(heading, 1, { opacity: 1, y: 0 }).to(content, 1, { opacity: 1, y: 0 }, '-=1').staggerFrom(promotions, .75, { scale: 0 }, .25).to(button, 1, { opacity: 1, y: 0 });
    };

    return Scene07;
  }(_scene2.default);

  var scene07 = new Scene07('#wwd-tourists', '.scene-panel', { duration: "300%", pushFollowers: false });
  scene07.$window.on('resize', checkScreen);

  function checkScreen() {
    scene07.resetScene();
    if (scene07.$window.width() < 768) return;

    scene07.setupScene();
  };

  checkScreen();
});

},{"./scene":19}],17:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-growth').length || Modernizr.touch) return;

  var Scene08 = function (_Scene) {
    _inherits(Scene08, _Scene);

    function Scene08() {
      _classCallCheck(this, Scene08);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene08.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var mask = parent.find('.wwd__mask');
      var introHeading = parent.find('.wwd-growth__intro-heading');
      var introContent = parent.find('.wwd-growth__intro-content');
      var slideHeading = parent.find('.wwd__slides-heading');
      var button = $('#wwd-growth__button');
      var slide1 = parent.find('.wwd-growth__slide--1');
      var slide2 = parent.find('.wwd-growth__slide--2');
      var slide3 = parent.find('.wwd-growth__slide--3');
      this.elements.push(parent, mask, introHeading, introContent, slideHeading, button, slide1, slide2, slide3);

      return new TimelineMax().to(mask, 10, { opacity: 0 }).to(mask, 1, { opacity: .9 }).to(introHeading, 1, { opacity: 1, y: 0 }).to(introContent, 1, { opacity: 1, y: 0 }, '-=.5').to(introHeading, 1, { opacity: 0 }, '+=2').to(introContent, 1, { opacity: 0 }, '-=1').to(slideHeading, 1, { opacity: 1, y: 0 }).to(slide1, 2, { opacity: 1, y: 0 }).to(button, 2, { opacity: 1, y: 0 }, '-=1').to(slide1, 2, { opacity: 0 }, '+=2').to(slide2, 2, { opacity: 1 }).to(slide2, 2, { opacity: 0 }, '+=2').to(slide3, 2, { opacity: 1 }).to(slide3, 2, { opacity: 1 });
    };

    return Scene08;
  }(_scene2.default);

  var scene08 = new Scene08('#wwd-growth', '.scene-panel', { duration: "500%", pushFollowers: true });
  scene08.$window.on('resize', checkScreen);

  function checkScreen() {
    scene08.resetScene();
    if (scene08.$window.width() < 768) return;

    scene08.setupScene();
  };

  checkScreen();
});

},{"./scene":19}],18:[function(require,module,exports){
'use strict';

var _scene = require('./scene');

var _scene2 = _interopRequireDefault(_scene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

$(document).ready(function () {
  if (!$('#wwd-security').length || Modernizr.touch) return;

  var Scene09 = function (_Scene) {
    _inherits(Scene09, _Scene);

    function Scene09() {
      _classCallCheck(this, Scene09);

      return _possibleConstructorReturn(this, _Scene.apply(this, arguments));
    }

    Scene09.prototype.getChildTimeline = function getChildTimeline(element) {
      var parent = $(element);
      var mask = parent.find('.wwd__mask');
      var slideHeading = parent.find('.wwd__slides-heading');
      var button = $('#wwd-security__button');
      var slide1 = parent.find('.wwd-security__slide--1');
      var slide2 = parent.find('.wwd-security__slide--2');
      this.elements.push(parent, mask, slideHeading, button, slide1, slide2);

      return new TimelineMax().to(mask, 12, { opacity: 0 }).to(mask, 1, { opacity: .9 }).to(slideHeading, 1, { opacity: 1, y: 0 }).to(slide1, 2, { opacity: 1, y: 0 }).to(button, 2, { opacity: 1, y: 0 }, '-=.5').to(slide1, 2, { opacity: 0 }, '+=2').to(slide2, 2, { opacity: 1 }).to(slide2, 2, { opacity: 1 });
    };

    return Scene09;
  }(_scene2.default);

  var scene09 = new Scene09('#wwd-security', '.scene-panel', { duration: "400%", pushFollowers: true });
  scene09.$window.on('resize', checkScreen);

  function checkScreen() {
    scene09.resetScene();
    if (scene09.$window.width() < 768) return;

    scene09.setupScene();
  };

  checkScreen();
});

},{"./scene":19}],19:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(trigger, parents, options) {
    _classCallCheck(this, _class);

    this.options = $.extend({
      duration: 600,
      pushFollowers: true,
      offset: 0,
      pin: true,
      triggerHook: 'onLeave',
      debug: false
    }, options || {});

    this.trigger = $(trigger);
    this.parents = this.trigger.find(parents);
    this.elements = [];
    this.childrenTimelines = [];
    this.$window = $(window);
    this.controller = new ScrollMagic.Controller();
  }

  _class.prototype.resetScene = function resetScene() {
    if (!this.scene) return;

    this.scene.removePin(true).removeTween(this.masterTimeline).remove().destroy();

    this.elements.forEach(function (el) {
      TweenLite.set(el, { clearProps: 'all' });
    });

    this.masterTimeline.kill();
    this.masterTimeline = null;
    this.childrenTimelines = [];
    this.elements = [];
    this.scene = null;
  };

  _class.prototype.setupScene = function setupScene() {
    this.masterTimeline = this.getTimeline();
    this.scene = this.addMagic();
  };

  _class.prototype.addMagic = function addMagic() {
    var self = this;
    var scene = new ScrollMagic.Scene({
      triggerElement: self.trigger.get(0),
      triggerHook: self.options.triggerHook,
      duration: self.options.duration,
      offset: self.options.offset
    });

    if (self.options.pin) {
      scene.setPin(this.trigger.get(0), {
        pushFollowers: self.options.pushFollowers
      });
    }

    scene.setTween(this.masterTimeline).addTo(this.controller);

    if (self.options.debug) {
      scene.addIndicators();
    }

    return scene;
  };

  _class.prototype.getTimeline = function getTimeline(stagger) {
    var self = this;
    this.parents.each(function () {
      var el = $(this);
      self.childrenTimelines.push(self.getChildTimeline(el));
    });

    var ops = {
      align: 'sequence',
      tweens: self.childrenTimelines
    };

    if (stagger) {
      ops.align = 'start';
      ops.stagger = stagger;
    }

    return new TimelineMax(ops);
  };

  _class.prototype.getChildTimeline = function getChildTimeline() {
    console.log('Override this method');
  };

  _class.prototype.addToChild = function addToChild(index, timeline, label) {
    var _this = this;

    timeline.getChildren().forEach(function (tween) {
      _this.elements.push(tween.target);
    });

    this.childrenTimelines[index].add(timeline, label);
  };

  return _class;
}();

exports.default = _class;

},{}]},{},[3]);
