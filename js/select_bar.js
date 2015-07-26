/**
 * LazyImg
 * author:@bxcn
 * date: 2015-01-10 22:51
 * version:v1.0
 */

(function(window) {
  // 匿名函数立即执行
  var domJs = domJs || (function() {

    var readyList, readyState = false, DOMContentLoaded, document = window.document, rootDomJs,
    // domJs函数返回的是一个new对象 可以在它的上面定义静态方法，只有一份
    domJs = function(selector) {
      return new domJs.fn.init(selector);
    };

    domJs.fn = domJs.prototype = {
      constructor : domJs,
      init : function(selector) {

        // 验证是否传过来的seletor是function\
        // rootDomJs = domJs(document)
        // 实现调用方法：
        // domJs(function(){
        //   这里是匿名函数体
        // });
        if( typeof selector === "function") {
          return rootDomJs.ready(selector);
        }
        return this;
      },
      ready : function(fn) {
        // 当第一个函数加载起来时才会调用bindReady函数体，并且只调用一次
        domJs.bindReady();
        // 把fn都存到数组中
        readyList.done(fn);
      }
    };
    domJs.fn.init.prototype = domJs.fn;

    /////////////////////////////////////以下定义的方法都静态方式/////////////////////////////////////////////////////

    /*
    * Dom解析完成后执行，并且只执行一次
    */
    domJs.ready = function() {
      if(!!readyState) {
        return false;
      }
      readyState = true;
      readyList.actionCallBack();
    }

    domJs._Deferred = function() {
      var callback = [], deferred = {
        done : function(fn) {
          // 把所以加载到DomJs中的函数都放到callback数组中缓存
          callback.push(fn);
        },
        // 执行所以加载到DomJs对角中的函数
        actionCallBack : function() {
          for(var i = 0, len = callback.length; i < len; i++) {
            callback[i].call(this);
          }
        }
      }
      return deferred;
    }

    domJs.bindReady = function() {

      // 只执行一次
      if(readyList) {
        return;
      }
      // 第一次执行时
      readyList = domJs._Deferred();

      // 以下函数体只执行一次
      if(document.readyState === "complete") {
        return setTimeout(domJs.ready, 1);
      }

      if(document.addEventListener) {
        document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
        window.addEventListener("load", domJs.ready, false);
      }

      if(document.attachEvent) {
        document.attachEvent("onreadystatechange", DOMContentLoaded);
        window.attachEvent("onload", domJs.ready);

      }
    }
    domJs.addEvent = function(el, type, fn) {

      if(window.addEventListener) {
        el.addEventListener(type, fn, false);
      } else if(window.attachEvent) {
        el.attachEvent("on" + type, fn);
      } else {
        el["on" + type] = fn;
      }
    }
    domJs.getId = function(id) {
      return document.getElementById(id);
    }
    // 定义DOMContentLoaded 当DOM解析完成后调用函数， 解除DOMContentLoaded绑定并且调用domJs.ready()
    if(document.addEventListener) {
      DOMContentLoaded = function() {
        document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
        domJs.ready();
      };

    } else if(document.attachEvent) {
      DOMContentLoaded = function() {
        if(document.readyState === "complete") {
          document.detachEvent("onreadystatechange", DOMContentLoaded);
          domJs.ready();
        }
      };
    }

    // rootDomJs = domJs(document) 支持以下调用方式
    // 实现调用方法：
    // domJs(function(){
    //   这里是匿名函数体
    // });
    rootDomJs = domJs(document);

    return domJs;

  })();

  window.domJs = domJs;

})(window);

(function(window, $) {
  var bodyWidth, 
      bodyHeight, 
      scrollArr = [], 
      resizeArr = [], 
      scrollTop = 0, 
      compatScroll = null, 
      compatResize = null, 
      _scrollTop = function() {
        if( typeof window.pageYOffset != 'undefined') {//pageYOffset指的是滚动条顶部到网页顶部的距离
          scrollTop = window.pageYOffset;
        } else if( typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
          scrollTop = document.documentElement.scrollTop;
        } else if( typeof document.body != 'undefined') {
          scrollTop = document.body.scrollTop;
        }
      },
      // 浏览器改变大小 时调用
      onChangeWindowSize = function() {
        _scrollTop();
        // document.compatMode=="CSS1Compat" 判定document采用标准模式 CSS1Compat：标准模式   BackCompat：怪异模式
        bodyWidth = document.compatMode == "CSS1Compat" ? document.documentElement.clientWidth : document.body.clientWidth;
        //Math.min(document.documentElement.clientWidth, document.body.clientWidth);
        bodyHeight = document.compatMode == "CSS1Compat" ? document.documentElement.clientHeight : document.body.clientHeight;
      },
      
      // 加载window对象
      addWindow = function(name, fn) {
        window[name] = fn;
      };
    
      addWindow("addEvent", function(el, type, fn) {
        if(window.addEventListener) {
          el.addEventListener(type, fn, false);
        } else if(window.attachEvent) {
          el.attachEvent("on" + type, fn);
        } else {
          el["on" + type] = fn;
        }
      });
    
      addWindow("bodyWidth", function() {
        return bodyWidth;
      });
      addWindow("bodyHeight", function() {
        return bodyHeight;
      });
      addWindow("scrollTop", function() {
        return scrollTop;
      });
      addWindow("init", function() {
        onChangeWindowSize();
      });
      addWindow("addScroll", function(fn) {
        scrollArr.push(fn);
        return this;
      });
      addWindow("addResize", function(fn) {
        resizeArr.push(fn);
        return this;
      });
    
      addEvent(window, "scroll", function() {
        window.clearTimeout(compatScroll);
        compatScroll = window.setTimeout(function() {
          for(var i = 0, len = scrollArr.length; i < len; i++) {
            scrollArr[i].call(this);
          }
        }, 400);
      });
      addEvent(window, "resize", function() {
        window.clearTimeout(compatResize);
        compatResize = window.setTimeout(function() {
          for(var i = 0, len = resizeArr.length; i < len; i++) {
            resizeArr[i].call(this);
          }
    
        }, 400);
      });
    
      window.addScroll(function() {
        _scrollTop();
      }).addResize(function() {
        init();
      });
    
      $(function() {
        init();
      });
})(window, window.domJs);

(function($, window) {
  var document = window.document;
  var LazyImg = (function( selector ){
    var LazyImg = function( selector ) {
      return new LazyImg.fn.init( selector );
    },
    lazyImgList;
    
    LazyImg.fn = LazyImg.prototype = {
      constructor: LazyImg,
      version: 2.3,
      init: function( selector ) {
      
        this.selector = selector || "";
        LazyImg.setClassName( this.selector );
        //@TODO
        //if ( LazyImg.setClassName && LazyImg.setClassName.indexOf( selector ) < 0 ) {
        //  LazyImg.setClassName.push( selector );
        //}
        //LazyImg.className( this.selector );
        
        return this;
      },
      show: function() {
        LazyImg.readImg( this.selector );
      }
    };

    //
    // LazyImg.className = function( selector ) {
      // var className = document.getElementById("JSH-LazyImgClassName");
      // var classNameVal = ( className.value && className.value.replace(/\b\s+\b/gi, " ")) + " ";
      // if ( !!selector && classNameVal.indexOf( selector ) < 0 ) {
        // className.value = className.value + selector +" ";
      // } else {
        // LazyImg.setClassName = className.value.split(" ");
        // return LazyImg.setClassName;
      // }
    // };
    //
    // LazyImg.createElement = function() {
      // var body = document.getElementsByTagName('body')[0];
      // var inputClassName = document.createElement("input");
      // inputClassName.id ="JSH-LazyImgClassName";
      // inputClassName.name="JSH-LazyImgClassName";
      // inputClassName.type = "hidden";
      // body.appendChild( inputClassName );
    // };
    LazyImg.loadImg = function() {
      var callBack = [];
      var data, images = document.images;
      /**
       * document文档中的lazy-data属性图片加载到lazyImg
       */
      for(var i = 0, len = images.length; i < len; i++) {
        
        image = images[i];
        
        var imgSrc = image.getAttribute("lazy-data") || image.getAttribute("data-original");
        var className = (image.getAttribute("class") || image.className || "").replace(/(^\s*)|(\s*$)/g, ""); // 空代表没有class样式

        if ( !!imgSrc ) {
          
          data = {
            img : image,
            url : imgSrc,
            width : image.width,
            height : image.height,
            className : className,
            show : false
          };
          
          callBack.push(data);
        }
      }
      
      return callBack;
    }
    LazyImg.readImg = function( selector ) {
    //////////////////////////////////////实现延迟加载图片功能/////////////////////////////////////////////
      var imgSrc, 
      data, 
      image, 
      className,
      imgOffsetTop, 
      selector = " " + selector + " ",
      winScrollTop = window.scrollTop(), 
      bodyHeight = window.bodyHeight(), 
      imagesArr = lazyImgList;
  
      for(var i = 0, len = imagesArr.length; i < len; i++) {
        
       data = imagesArr[i]
       show = data.show;
         
        // 判定是否已经加载过了，并且lazy属性不是lazy-all-img, 那么他是局部加载图片
        if( !show ) {
          
          var doc = data.img.ownerDocument;
          var body = doc.body;
          var _top  = doc.documentElement.clientTop || body.clientTop;  // 非IE为0，IE为2
          var _left = doc.documentElement.clientLeft || body.clientLeft; // 非IE为0，IE为2
          var rect = data.img.getBoundingClientRect();
          var top = rect.top - _top + window.scrollTop();
           
          className = data.className;
          height = data.height;
          imgSrc = data.url;
          imgOffsetTop = top;
          
          /*
           * 第一步：验证是是否有Class样式
           * 第二步：验证class样式里是否包含lazy-开头的class样式
           */
          if ( (!className) || isClassName( className ) ) {
            className = "";
          }
          
         // console.log( selector + "   "+className);
          if(winScrollTop >= (imgOffsetTop - bodyHeight - 100 ) && 
             winScrollTop <= (imgOffsetTop + height ) && 
             isClassName( className, selector ) ) {
            data.img.src = imgSrc;
            data.show = true;
          }
        }
      }
    };
    var _setClassName = [];
    LazyImg.setClassName = function( className ) {
      if ( arguments.length != 0 ) {
        for ( var i = 0, len = _setClassName.length; i < len; i++ ) {
           if ( _setClassName[ i ] == className ) {
             break;
           }
        }
        _setClassName.push( className );
      } else {
        return _setClassName || [];
      }
    };
    var isClassName = function( className, selector ) {
      var isClassName = false;
      if ( arguments.length == 2 ) { 
        className = " " + className.replace(/\b\s+\b/gi, " ") + " ";
        if ( className.indexOf( selector ) > -1 ) {
          isClassName =  true;
        }
      } else {
        isClassName = ( className.indexOf("lazy-") < 0 );
      }
      return isClassName;
    },
    cacheLazyLoadedImg = {};
    // 全局加载图片模式
    LazyImg.loadedImg = function() {
      
              
      if ( !lazyImgList ) {
        // 创建input隐藏域
        //@TODO
        //LazyImg.createElement();
        lazyImgList = LazyImg.loadImg();
      }
        
      var setClassName = LazyImg.setClassName();
      for ( var i = 0, len = setClassName.length; i < len; i++ ) {
        var className = setClassName[ i ];
        
        cacheLazyLoadedImg[ className ] = cacheLazyLoadedImg[ className ] || LazyImg( className );
        cacheLazyLoadedImg[ className ].show();
      }
    }
    
    LazyImg.lazy = function( className ) {
      // 同时添加到全局加载图片模式
      LazyImg.setClassName(className);
      LazyImg.loadedImg();
    }
    
    LazyImg.fn.init.prototype = LazyImg.fn;
    
    return LazyImg;
  })();
  
  // 定义默认属性
  LazyImg.defaults = {
    className: undefined,
    action: true
  };
  
  //window.lazyClassName = LazyImg.setClassName;
  window.LzDefault = LazyImg.defaults;
  window.LazyImg = LazyImg;
  
  
  function goActionImg() {
    if ( LazyImg.defaults.action ) {
      LazyImg.loadedImg();
    }
  }
  
  //在window上绑定的事件
  window.addScroll(function() {
    goActionImg();
  }).addResize(function() {
    goActionImg();
  });

  // Dom解析完后执行
  domJs(function() {
    LazyImg.setClassName( LazyImg.defaults.className );
    goActionImg();
  });
  // 放大模式
})(window.domJs, window );

