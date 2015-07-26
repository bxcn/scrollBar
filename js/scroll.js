/**
 * @author @bxcn
 * Date: 2015-03-15
 */
var JshScroll = (function() {
  var JshScroll = function(scrollBar, content, topBtn, bottomBtn, leftBtn, rightBtn, scrollPx) {

    var startX, // 点击时坐标X
    startY, // 点击时坐标Y

    scrollBar, //
    scrollBarWidth, //
    scrollBarHeight, //
    scrollBarOffsetTop, //
    scrollBarOffsetLeft, //

    scrollBarParent, content, //
    contentWidth, // 滚动内容宽度
    contentHeihgt, //
    contentMoveWidth, // 滚动条按钮可移动的X范围
    contentMoveHeight, // 滚动按钮可移动的Y范围
    contentOffsetTop, //
    contentOffsetLeft, //

    topBtn, //
    bottomBtn, //
    leftBtn, //
    rightBtn, //

    scrollBarParent, //
    scrollBarParentOffsetTop, //
    scrollBarParentOffsetLeft, //
    scrollBarParentWidth, //
    scrollBarParentHeight, //
    scrollBarMoveWidth, //
    scrollBarMoveHeight, moveXBiLi, moveYBiLi,

    // 滚动条按钮范围
    scrollBarBround = {
      top : 0,
      right : 0,
      bottom : 0,
      left : 0
    },
    // 滚动条范围
    scrollBarParentBround = {
      top : 0,
      right : 0,
      bottom : 0,
      left : 0
    }, bili, isDrag = false;
    //

    // 初始化滚动条大小
    (function init() {
      // 滚动条按钮高度

      content = JshScroll.id(content);
      //
      topBtn = JshScroll.id(topBtn);
      //
      bottomBtn = JshScroll.id(bottomBtn);
      //
      leftBtn = JshScroll.id(leftBtn);
      //
      rightBtn = JshScroll.id(rightBtn);
      //

      scrollBar = JshScroll.id(scrollBar);
      //
      // 滚动条按钮的父对象
      scrollBarParent = scrollBar.offsetParent;
      //
      scrollBarParentOffsetTop = scrollBarParent.offsetTop;
      // 滚动条宽度
      scrollBarParentOffsetLeft = scrollBarParent.offsetLeft;
      // 滚动条高度
      scrollBarParentWidth = scrollBarParent.offsetWidth;
      // 滚动条宽度
      scrollBarParentHeight = scrollBarParent.offsetHeight;
      // 滚动条高度

      contentWidth = content.offsetWidth;
      // 滚动内容宽度
      contentHeihgt = parseInt(content.offsetHeight);
      // 滚动内容
      // 解决滚动到底部时出现定位不精确
      contentHeihgt = (contentHeihgt % 2 == 0 ) ? contentHeihgt : contentHeihgt + 1;
      contentMoveWidth = contentWidth - content.offsetParent.clientHeight;
      // 滚动条按钮可移动的X范围
      contentMoveHeight = contentHeihgt - content.offsetParent.clientHeight;
      // 滚动按钮可移动的Y范围
      /*
       * 解决移动的高度过小，以至于不需要移动，如果鬼魂的高度小于3像素，就默认为不需要移动它
       */
      bili = (contentMoveHeight < 3 ? 0 : contentMoveHeight ) / content.offsetParent.offsetHeight;
      // bili = bili < 0.01 ? 0.01 : bili;
      scrollBarWidth = scrollBar.offsetWidth;
      // 滚动条按钮的宽度
      scrollBarHeight = scrollBarParentHeight / (bili < 1 ? 1 : bili );
      //滚动条按钮的高度
      scrollBarMoveWidth = scrollBarParentHeight - scrollBarWidth;
      // 滚动条按钮可移动的X范围
      scrollBarMoveHeight = scrollBarParentHeight - scrollBarHeight;
      // 滚动按钮可移动的Y范围

      // 内容移动的比例
      moveYBiLi = (contentMoveHeight / scrollBarMoveHeight);
      
      scrollBar.style.height = scrollBarHeight + "px";
      content.style.height = contentHeihgt + "px";

    })();

    // 点击滚动条按钮触发的事件
    scrollBar.onmousedown = mousedown;
    
    content.offsetParent.onmouseover = function() {
      document.onkeydown = onkeydown;
    }
    content.offsetParent.onmouseout = function() {
      document.onkeydown = null;
    }
    
    function onkeydown ( event ) {
      
      event = JshScroll.getEvent( event );
      
        if ( event.keyCode == 38 ) {
          downTopBtn();
        } else if ( event.keyCode == 40 ) {
          downBottomBtn();
        }
      
      JshScroll.prevent(event);
    }
    

    // 滚动条按钮的父对象
    scrollBarParent.onmousedown = function(event) {

      var x, y;
      event = JshScroll.getEvent(event);
      x = event.layerX || event.x;
      y = event.layerY || event.y;

      getLayer();

      if(y < scrollBarBround.top) {
        downTopBtn();
      }

      if(y > scrollBarBround.bottom) {
        downBottomBtn();
      }

      JshScroll.prevent(event);
    }
    // 滚动条按钮的父对象
    function onmousescroll(event) {
      // 正：向上     负：向下
      var direction = 0;
      event = JshScroll.getEvent(event);

      if(event.wheelDelta) {//IE/Opera/Chrome
        direction = event.wheelDelta;
      } else if(event.detail) {//Firefox
        direction = event.detail * -1;
      }
      // 向上滚动
      if(direction > 0) {
        downTopBtn();
      }
      // 向下滚动
      if(direction < 0) {
        downBottomBtn();
      }
      JshScroll.prevent(event);
    }

    // 绑定滚动事件
    (function(scrollBarParent, content) {
      if(document.addEventListener) {
        content.offsetParent.addEventListener('DOMMouseScroll', onmousescroll, false);
      }//W3C
      content.offsetParent.onmousewheel = content.offsetParent.onmousewheel = onmousescroll;
      //IE/Opera/Chrome
    })(scrollBarParent, content);

    // 点击向上按钮
    if(!!topBtn) {
      topBtn.onmousedown = downTopBtn;
    }
    // 点击向下按钮
    if(!!bottomBtn) {
      bottomBtn.onmousedown = downBottomBtn;
    }

    function downTopBtn() {
      getLayer();
      setLayer(0, -scrollPx);
    }

    function downBottomBtn() {
      getLayer();
      setLayer(0, scrollPx);
    }

    function mousemove(event) {
      var endX, endY, dx, dy;

      if(isDrag) {
        event = JshScroll.getEvent(event);
        endX = event.clientX;
        endY = event.clientY;
        dx = endX - startX;
        dy = endY - startY;
        setLayer(dx, dy);
      }

    }

    function setLayer(addX, addY) {

      var top, left, contentTop, contentLeft;

      if(bili <= 0)
        return false;
        
      // 滚动条按钮位置
      top = scrollBarOffsetTop + addY;
      left = scrollBarOffsetLeft + addX;
      
      // 内容位置
      contentTop = contentOffsetTop + -moveYBiLi * addY;
      contentLeft = contentOffsetLeft + -moveXBiLi * addX;

      if(top <= 0) {
        top = 0;
        contentTop = 0;
      } else if(top >= scrollBarMoveHeight) {
        top = scrollBarMoveHeight;
      }
      
      if ( contentTop <= -contentMoveHeight ) {
        contentTop = -contentMoveHeight;
      }

      scrollBar.style.top = top + "px";
      content.style.top = contentTop + "px";
    }

    // 设置滚动条按钮 和内容当前位置
    function getLayer() {
      scrollBarOffsetTop = scrollBar.offsetTop;
      scrollBarOffsetLeft = scrollBar.offsetLeft;
      contentOffsetTop = content.offsetTop;
      contentOffsetLeft = content.offsetLeft;

      scrollBarBround.left = scrollBarOffsetLeft;
      scrollBarBround.right = scrollBarOffsetLeft + scrollBarWidth;
      scrollBarBround.top = scrollBarOffsetTop;
      scrollBarBround.bottom = scrollBarOffsetTop + scrollBarHeight;

    }

    function mouseup(o) {
      isDrag = false;
      document.onmousedown = null;
      document.onmouseup = null;
    }

    function mousedown(event) {
      var event = JshScroll.getEvent(event);
      startX = event.clientX;
      startY = event.clientY;
      getLayer();
      isDrag = true;

      document.onmousemove = mousemove;
      document.onmouseup = mouseup;
      // 阻止默认冒泡
      JshScroll.prevent(event);
    }

  }
  JshScroll.id = function(id) {
    if( typeof id === "undefined") {
      return null;
    }
    return document.getElementById(id);
  }
  JshScroll.getEvent = function(event) {
    if( typeof event == 'undefined') {
      event = window.event;
    }
    if( typeof event.x == 'undefined') {
      event.x = event.layerX;
    }
    if( typeof event.y == 'undefined') {
      event.y = event.layerY;
    }

    return event;
  }
  JshScroll.prevent = function(event) {

    var event = JshScroll.getEvent(event);

    if(event.preventDefault) {
      event.preventDefault();
    }

    if(event.stopPropagation) {
      event.stopPropagation();
    }

    event.cancelBubble = true;
    event.returnValue = false;
  }

  return JshScroll;
})();
