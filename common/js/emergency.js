jQuery(function($){

  //#emergencyの処理
  var bodyElm = $('body'),
  bodyClasses = typeof bodyElm.attr('class') != 'undefined' ? bodyElm.attr('class').split(' ') : '',
  emergencyCookieName = 'URGENCY_NEWS',
  emergencyJsonURL = 'urgency_news.json',
  emergencyType = 'emergency',
  emergencyJsonURL = '/vi/json/urgency_news.json';//各国でパスの書き換え
  if($.inArray("emergency", bodyClasses) !== -1){
    emergencyXhr = $.ajax({
      url: emergencyJsonURL,
      dataType: 'json',
      timeout: 30000
    });
    emergencyXhr.success(function(res){

      var cookieDataObj = getCookie(emergencyCookieName) == null ? JSON.parse('{"' + emergencyType + '": []}') : JSON.parse(getCookie(emergencyCookieName)),
      popupArr = ['', ' class="" target="_blank"'],//別Winアイコンの設定をする場合は class="" で設定
      code = '';
      code += '<div class="emergency-wrap">';
      code += '<div class="emergency-wrap-in">';
      $(res.urgencyNews).each(function(i, obj){
        var thisNewsId = obj.newsId,
        thisPopupAttr = popupArr[obj.popup - 1];
        if(cookieDataObj[emergencyType].indexOf(thisNewsId) < 0){
          code += '<div class="emergency-banner">';
          code += '<div class="emergency-banner__in">';
          code += '<div class="emergency-banner__label">';
          code += '<svg class="site-icon site-icon--fill site-icon--notice">';
          code += '<use xlink:href="#icon-notice"></use>';
          code += '</svg>';
          code += '<em class="text-label">NOTICE</em>';//各国で文言書き換え
          code += '</div>';
          code += '<div class="emergency-banner__txt">';
          code += obj.title + '<p class="linkTxt">' + '<a href="' + obj.url + '"' + thisPopupAttr + ' data-newsId="' + thisNewsId + '">' + 'Learn More' + '</a>' + '</p>';//各国で文言書き換え
          code += '</div>';
          code += '<div class="emergency-banner__btn">';
          code += '<a class="emergency-banner__close close-trigger"></a>';
          code += '</div>';
          code += '</div>';
          code += '</div>';
        }
      });
      code += '</div>';
      code += '</div>';
      bodyElm.prepend(code);
      var emergencyElm = $('.emergency-wrap');
      var emergencyCloseBtn = emergencyElm.find('.emergency-banner__close');
      emergencyElm.hide();
      if(emergencyElm.find('.emergency-banner').length > 0){
        emergencyElm.slideDown(1000);
      }else{
        emergencyElm.remove();
      }
      emergencyCloseBtn.click(function(){
        var thisElm = $(this),
        thisParemtElm = thisElm.parents('.emergency-banner');
        thisParemtElm.animate({
          opacity: 0
        }, 400, function(){
          thisParemtElm.remove();
          var ommitId = thisParemtElm.find('p a').attr('data-newsId');
          cookieDataObj = getCookie(emergencyCookieName) == null ? JSON.parse('{"' + emergencyType + '": []}') : JSON.parse(getCookie(emergencyCookieName));
          if(cookieDataObj[emergencyType].indexOf(ommitId) < 0){
            cookieDataObj[emergencyType].push(ommitId);
          }
          setCookie(emergencyCookieName, JSON.stringify(cookieDataObj), 365);
          if(emergencyElm.find('.emergency-banner').length == 0){
            emergencyElm.remove();
          }
        });
      });
    });
  }
});

/* function */
/** setCookie **/
function setCookie(name, value, days){
  if(days){
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = '; expires=' + date.toGMTString();
  }else{
    var expires = '';
  }document.cookie = name+'=' + value + expires + '; path=/';
}
/** getCookie **/
function getCookie(name){
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for(var i = 0, thisLen = ca.length;i < thisLen; i++){
    var c = ca[i];
    while(c.charAt(0) == ' ') c = c.substring(1, c.length);
    if(c.indexOf(nameEQ)== 0) return c.substring(nameEQ.length, c.length);
  }return null;
}
