"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _extends=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n])}return e},_createClass=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}(),Slinky=function(){function e(t){var i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};_classCallCheck(this,e),this.settings=_extends({},this.options,i),this._init(t)}return _createClass(e,[{key:"options",get:function(){return{resize:!0,speed:300,theme:"slinky-theme-default",title:!1}}}]),_createClass(e,[{key:"_init",value:function(e){this.menu=$(e),this.base=this.menu.children().first();this.base;var t=this.menu,i=this.settings;t.addClass("slinky-menu").addClass(i.theme),this._transition(i.speed),$("a + ul",t).prev().addClass("next"),$("li > a",t).wrapInner("<span>");var n=$("<li>").addClass("header");$("li > ul",t).prepend(n);var s=$("<a>").prop("href","#").addClass("back");$(".header",t).prepend(s),i.title&&$("li > ul",t).each(function(e,t){var i=$(t).parent().find("a").first().text();if(i){var n=$("<header>").addClass("title").text(i);$("> .header",t).append(n)}}),this._addListeners(),this._jumpToInitial()}},{key:"_addListeners",value:function(){var e=this,t=this.menu,i=this.settings;$("a",t).on("click",function(n){if(e._clicked+i.speed>Date.now())return!1;e._clicked=Date.now();var s=$(n.currentTarget);(0===s.attr("href").indexOf("#")||s.hasClass("next")||s.hasClass("back"))&&n.preventDefault(),s.hasClass("next")?(t.find(".active").removeClass("active"),s.next().show().addClass("active"),e._move(1),i.resize&&e._resize(s.next())):s.hasClass("back")&&(e._move(-1,function(){t.find(".active").removeClass("active"),s.parent().parent().hide().parentsUntil(t,"ul").first().addClass("active")}),i.resize&&e._resize(s.parent().parent().parentsUntil(t,"ul")))})}},{key:"_jumpToInitial",value:function(){var e=this.menu.find(".active");e.length>0&&(e.removeClass("active"),this.jump(e,!1))}},{key:"_move",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){};if(0!==e){var i=this.settings,n=this.base,s=Math.round(parseInt(n.get(0).style.left))||0;n.css("left",s-100*e+"%"),"function"==typeof t&&setTimeout(t,i.speed)}}},{key:"_resize",value:function(e){this.menu.height(e.outerHeight())}},{key:"_transition",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:300,t=this.menu,i=this.base;t.css("transition-duration",e+"ms"),i.css("transition-duration",e+"ms")}},{key:"jump",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];if(e){var i=this.menu,n=this.settings,s=$(e),a=i.find(".active"),r=0;a.length>0&&(r=a.parentsUntil(i,"ul").length),i.find("ul").removeClass("active").hide();var l=s.parentsUntil(i,"ul");l.show(),s.show().addClass("active"),t||this._transition(0),this._move(l.length-r),n.resize&&this._resize(s),t||this._transition(n.speed)}}},{key:"home",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],t=this.base,i=this.menu,n=this.settings;e||this._transition(0);var s=i.find(".active"),a=s.parentsUntil(i,"ul");this._move(-a.length,function(){s.removeClass("active").hide(),a.not(t).hide()}),n.resize&&this._resize(t),!1===e&&this._transition(n.speed)}},{key:"destroy",value:function(){var e=this,t=this.base,i=this.menu;$(".header",i).remove(),$("a",i).removeClass("next").off("click"),i.css({height:"","transition-duration":""}),t.css({left:"","transition-duration":""}),$("li > a > span",i).contents().unwrap(),i.find(".active").removeClass("active"),i.attr("class").split(" ").forEach(function(e){0===e.indexOf("slinky")&&i.removeClass(e)}),["settings","menu","base"].forEach(function(t){return delete e[t]})}}]),e}();jQuery.fn.slinky=function(e){return new Slinky(this,e)};
//# sourceMappingURL=slinky.min.js.map
