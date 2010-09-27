var firebug = {
  version:[1.23,20090506],
  el:{}, 
  env:{ 
    "css":"http://getfirebug.com/releases/lite/1.2/firebug-lite.css", 
    "debug":false,
    "detectFirebug":true,
    "dIndex":"console", 
    "height":295,
    "hideDOMFunctions":false,
    "openInPopup": false,
    "override":false,
    "ml":false,
    "showIconWhenHidden":true,
    "popupTop":1,
    "popupLeft":1,
    "popupWidth":undefined,
    "popupHeight":undefined,
    "textNodeChars":0
  },
  internal:{
    "cache":{},
    "extConsole":null,
    "init":false,
    "isPopup":false,
    "liteFilename":null,
    "minimized":false,
    "popupWin":null,
    "targetWindow":undefined
  },
  initConsole:function(){
    /* 
     * initialize the console - user defined values are not available within this method because FBLite is not yet initialized
     */
    var command;
    try{
      if((!window.console || (window.console && !window.console.firebug)) || (firebug.env.override && !(/Firefox\/3/i.test(navigator.userAgent)))){
        window.console = { "provider":"Firebug Lite" };

        for(command in firebug.d.console.cmd){
          window.console[command] = firebug.lib.util.Curry(firebug.d.console.run,window,command);
        };
      }
      window.onerror = function(_message,_file,_line){
        firebug.d.console.run('error',firebug.lib.util.String.format('{0} ({1},{2})',_message,firebug.getFileName(_file),_line));
      };
      } catch(e){}
  },
  overrideConsole:function(){
    with (firebug){
      env.override=true;
      try{
        internal.extConsole=window.console;
      } catch(e){}
      initConsole();
    }
  },
  restoreConsole:function(){
    with(firebug){
      if(internal.extConsole){
        env.override=false;
        try{
          window.console=internal.extConsole;
        } catch(e){}
        internal.extConsole=null;
      }
    }
  },
  init:function(_css){
    var i,
        cssLoaded=false,
        iconTitle = "Click here or press F12, (CTRL|CMD)+SHIFT+L or SHIFT+ENTER to show Firebug Lite. CTRL|CMD click this icon to hide it.";
  
    with(firebug){
      if(document.getElementsByTagName('html')[0].attributes.getNamedItem('debug')){
        env.debug = document.getElementsByTagName('html')[0].attributes.getNamedItem('debug').nodeValue !== "false";
      }
            
      if(internal.isPopup) {
        env.openInPopup = false;
        internal.targetWindow = window.opener;
        env.popupWidth = window.opener.firebug.env.popupWidth || window.opener.firebug.lib.util.GetViewport().width;
        env.popupHeight = window.opener.firebug.env.popupHeight || window.opener.firebug.lib.util.GetViewport().height;
      } else {
        internal.targetWindow = window;
        env.popupWidth = env.popupWidth || lib.util.GetViewport().width;
        env.popupHeight = env.popupHeight || lib.util.GetViewport().height;
      }

      settings.readCookie();
      
      if(internal.init || (env.detectFirebug && window.console && window.console.firebug)) {
        return;
      }

      for(i=0;i<document.styleSheets.length;i++) {
        if(/firebug-lite\.css/i.test(document.styleSheets[i].href)) {
          cssLoaded=true;
          break;
        }
      }
      
      if(!cssLoaded){
        document.getElementsByTagName("head")[0].appendChild(
          new lib.element("link").attribute.set("rel","stylesheet").attribute.set("type","text/css").attribute.set("href",env.css).element
        );
      }

      if(env.override){
        overrideConsole();
      }
      
      /* 
       * Firebug Icon
       */
      el.firebugIcon = new lib.element("div").attribute.set('firebugIgnore',true).attribute.set("id","firebugIconDiv").attribute.set("title",iconTitle).attribute.set("alt",iconTitle).event.addListener("mousedown",win.iconClicked).insert(document.body);
      
      /* 
       * main interface
       */
      el.content = {};
      el.mainiframe = new lib.element("IFRAME").attribute.set("id","FirebugIFrame").attribute.set('firebugIgnore',true).environment.addStyle({ "display":"none", "width":lib.util.GetViewport().width+"px" }).insert(document.body);
      el.main = new lib.element("DIV").attribute.set("id","Firebug").attribute.set('firebugIgnore',true).environment.addStyle({ "display":"none", "width":lib.util.GetViewport().width+"px" }).insert(document.body);
      if(!internal.isPopup){
        el.resizer = new lib.element("DIV").attribute.addClass("Resizer").event.addListener("mousedown",win.resizer.start).insert(el.main);
      }
      el.header = new lib.element("DIV").attribute.addClass("Header").insert(el.main);
      el.left = {};
      el.left.container = new lib.element("DIV").attribute.addClass("Left").insert(el.main);
      el.right = {};
      el.right.container = new lib.element("DIV").attribute.addClass("Right").insert(el.main);
      el.main.child.add(new lib.element("DIV").attribute.addClass('Clear'));

      /*
       * buttons
       */
      el.button = {};
      el.button.container = new lib.element("DIV").attribute.addClass("ButtonContainer").insert(el.header);
      el.button.logo = new lib.element("A").attribute.set("title","Firebug Lite").attribute.set("target","_blank").attribute.set("href","http://getfirebug.com/lite.html").update("&nbsp;").attribute.addClass("Button Logo").insert(el.button.container);
      el.button.inspect = new lib.element("A").attribute.addClass("Button").event.addListener("click",internal.targetWindow.firebug.d.inspector.toggle).update("Inspect").insert(el.button.container);
      el.button.dock = new lib.element("A").attribute.addClass("Button Dock").event.addListener("click", win.dock).insert(el.button.container);
      el.button.newWindow = new lib.element("A").attribute.addClass("Button NewWindow").event.addListener("click", win.newWindow).insert(el.button.container);

      if(!internal.isPopup){
        el.button.maximize = new lib.element("A").attribute.addClass("Button Maximize").event.addListener("click",win.maximize).insert(el.button.container);
        el.button.minimize = new lib.element("A").attribute.addClass("Button Minimize").event.addListener("click",win.minimize).insert(el.button.container);
        el.button.close = new lib.element("A").attribute.addClass("Button Close").event.addListener("click",win.hide).insert(el.button.container);
      }

      if(lib.env.ie||lib.env.webkit){
        el.button.container.environment.addStyle({ "paddingTop":"12px" });
      }

      /*
       * navigation
       */
      el.nav = {};
      el.nav.container = new lib.element("DIV").attribute.addClass("Nav").insert(el.left.container);
      el.nav.console = new lib.element("A").attribute.addClass("Tab Selected").event.addListener("click",lib.util.Curry(d.navigate,window,"console")).update("Console").insert(el.nav.container);
      el.nav.html = new lib.element("A").attribute.addClass("Tab").update("HTML").event.addListener("click",lib.util.Curry(d.navigate,window,"html")).insert(el.nav.container);
      el.nav.css = new lib.element("A").attribute.addClass("Tab").update("CSS").event.addListener("click",lib.util.Curry(d.navigate,window,"css")).insert(el.nav.container);
      if(!internal.isPopup){
        el.nav.scripts = new lib.element("A").attribute.addClass("Tab").update("Script").event.addListener("click",lib.util.Curry(d.navigate,window,"scripts")).insert(el.nav.container);
      }
      el.nav.dom = new lib.element("A").attribute.addClass("Tab").update("DOM").event.addListener("click",lib.util.Curry(d.navigate,internal.targetWindow,"dom")).insert(el.nav.container);
      el.nav.xhr = new lib.element("A").attribute.addClass("Tab").update("XHR").event.addListener("click",lib.util.Curry(d.navigate,window,"xhr")).insert(el.nav.container);
      el.nav.optionsdiv = new lib.element("DIV").attribute.addClass("Settings").insert(el.nav.container);
      el.nav.options = new lib.element("A").attribute.addClass("Tab Button Options").update("Options&nbsp;&nbsp;&nbsp;&nbsp;").event.addListener("click", settings.toggle).insert(el.nav.optionsdiv);
      
      /*
       * inspector
       */
      el.borderInspector = new lib.element("DIV").attribute.set("id","FirebugBorderInspector").attribute.set('firebugIgnore',true).event.addListener("click",listen.inspector).insert(document.body);
      el.bgInspector = new lib.element("DIV").attribute.set("id","FirebugBGInspector").attribute.set('firebugIgnore',true).insert(document.body);

      /*
       * console
       */
      el.left.console = {};
      el.left.console.container = new lib.element("DIV").attribute.addClass("Console").insert(el.left.container);
      el.left.console.mlButton = new lib.element("A").attribute.addClass("MLButton").event.addListener("click",d.console.toggleML).insert(el.left.console.container);
      el.left.console.monitor = new lib.element("DIV").insert(
          new lib.element("DIV").attribute.addClass("Monitor").insert(el.left.console.container)
      );
      el.left.console.container.child.add(
          new lib.element("DIV").attribute.addClass("InputArrow").update(">>>")
      );
      el.left.console.input = new lib.element("INPUT").attribute.set("type","text").attribute.addClass("Input").event.addListener("keydown",listen.consoleTextbox).insert(
          new lib.element("DIV").attribute.addClass("InputContainer").insert(el.left.console.container)
      );

      el.right.console = {};
      el.right.console.container = new lib.element("DIV").attribute.addClass("Console Container").insert(el.right.container);
      el.right.console.mlButton = new lib.element("A").attribute.addClass("MLButton CloseML").event.addListener("click",d.console.toggleML).insert(el.right.console.container);
      el.right.console.input = new lib.element("TEXTAREA").attribute.addClass("Input").insert(el.right.console.container);
      el.right.console.input.event.addListener("keydown",lib.util.Curry(tab,window,el.right.console.input.element));
      el.right.console.run = new lib.element("A").attribute.addClass("Button").event.addListener("click",listen.runMultiline).update("Run").insert(el.right.console.container);
      el.right.console.clear = new lib.element("A").attribute.addClass("Button").event.addListener("click",lib.util.Curry(d.clean,window,el.right.console.input)).update("Clear").insert(el.right.console.container);

      el.button.console = {};
      el.button.console.container = new lib.element("DIV").attribute.addClass("ButtonSet").insert(el.button.container);
      el.button.console.clear = new lib.element("A").attribute.addClass("Button").event.addListener("click",d.console.clear).update("Clear").insert(el.button.console.container);

      /*
       * html
       */

      el.left.html = {};
      el.left.html.container = new lib.element("DIV").attribute.addClass("HTML").insert(el.left.container);

      el.right.html = {};
      el.right.html.container = new lib.element("DIV").attribute.addClass("HTML Container").insert(el.right.container);

      el.right.html.nav = {};
      el.right.html.nav.container = new lib.element("DIV").attribute.addClass("Nav").insert(el.right.html.container);
      el.right.html.nav.computedStyle = new lib.element("A").attribute.addClass("Tab Selected").event.addListener("click",lib.util.Curry(d.html.navigate,firebug,"computedStyle")).update("Computed Style").insert(el.right.html.nav.container);
      el.right.html.nav.dom = new lib.element("A").attribute.addClass("Tab").event.addListener("click",lib.util.Curry(d.html.navigate,firebug,"dom")).update("DOM").insert(el.right.html.nav.container);

      el.right.html.content = new lib.element("DIV").attribute.addClass("Content").insert(el.right.html.container);

      el.button.html = {};
      el.button.html.container = new lib.element("DIV").attribute.addClass("ButtonSet HTML").insert(el.button.container);

      /*
       * css
       */

      el.left.css = {};
      el.left.css.container = new lib.element("DIV").attribute.addClass("CSS").insert(el.left.container);

      el.right.css = {};
      el.right.css.container = new lib.element("DIV").attribute.addClass("CSS Container").insert(el.right.container);

      el.right.css.nav = {};
      el.right.css.nav.container = new lib.element("DIV").attribute.addClass("Nav").insert(el.right.css.container);
      el.right.css.nav.runCSS = new lib.element("A").attribute.addClass("Tab Selected").update("Run CSS").insert(el.right.css.nav.container);

      el.right.css.mlButton = new lib.element("A").attribute.addClass("MLButton CloseML").event.addListener("click",d.console.toggleML).insert(el.right.css.container);
      el.right.css.input = new lib.element("TEXTAREA").attribute.addClass("Input").insert(el.right.css.container);
      el.right.css.input.event.addListener("keydown",lib.util.Curry(firebug.tab,window,el.right.css.input.element));
      el.right.css.run = new lib.element("A").attribute.addClass("Button").event.addListener("click",listen.runCSS).update("Run").insert(el.right.css.container);
      el.right.css.clear = new lib.element("A").attribute.addClass("Button").event.addListener("click",lib.util.Curry(d.clean,window,el.right.css.input)).update("Clear").insert(el.right.css.container);

      el.button.css = {};
      el.button.css.container = new lib.element("DIV").attribute.addClass("ButtonSet CSS").insert(el.button.container);
      el.button.css.selectbox = new lib.element("SELECT").event.addListener("change",listen.cssSelectbox).insert(el.button.css.container);

      /*
       * scripts
       */

      el.left.scripts = {};
      el.left.scripts.container = new lib.element("DIV").attribute.addClass("Scripts").insert(el.left.container);

      el.right.scripts = {};
      el.right.scripts.container = new lib.element("DIV").attribute.addClass("Scripts Container").insert(el.right.container);

      el.button.scripts = {};
      el.button.scripts.container = new lib.element("DIV").attribute.addClass("ButtonSet Scripts").insert(el.button.container);
      el.button.scripts.selectbox = new lib.element("SELECT").event.addListener("change",listen.scriptsSelectbox).insert(el.button.scripts.container);
      el.button.scripts.lineNumbers = new lib.element("A").attribute.addClass("Button").event.addListener("click",d.scripts.toggleLineNumbers).update("Show Line Numbers").insert(el.button.scripts.container);

      /*
       * dom
       */

      el.left.dom = {};
      el.left.dom.container = new lib.element("DIV").attribute.addClass("DOM").insert(el.left.container);

      el.right.dom = {};
      el.right.dom.container = new lib.element("DIV").attribute.addClass("DOM Container").insert(el.right.container);

      el.button.dom = {};
      el.button.dom.container = new lib.element("DIV").attribute.addClass("ButtonSet DOM").insert(el.button.container);
      el.button.dom.label = new lib.element("LABEL").update("Object Path:").insert(el.button.dom.container);
      el.button.dom.textbox = new lib.element("INPUT").event.addListener("keydown",listen.domTextbox).update(internal.isPopup?"window.opener":"window").insert(el.button.dom.container);

      /*
       * str
       */
      el.left.str = {};
      el.left.str.container = new lib.element("DIV").attribute.addClass("STR").insert(el.left.container);

      el.right.str = {};
      el.right.str.container = new lib.element("DIV").attribute.addClass("STR").insert(el.left.container);

      el.button.str = {};
      el.button.str.container = new lib.element("DIV").attribute.addClass("ButtonSet XHR").insert(el.button.container);
      el.button.str.watch = new lib.element("A").attribute.addClass("Button").event.addListener("click",lib.util.Curry(d.navigate,window,"xhr")).update("Back").insert(el.button.str.container);

      /*
       * xhr
       */
      el.left.xhr = {};
      el.left.xhr.container = new lib.element("DIV").attribute.addClass("XHR").insert(el.left.container);

      el.right.xhr = {};
      el.right.xhr.container = new lib.element("DIV").attribute.addClass("XHR").insert(el.left.container);


      el.button.xhr = {};
      el.button.xhr.container = new lib.element("DIV").attribute.addClass("ButtonSet XHR").insert(el.button.container);
      el.button.xhr.label = new lib.element("LABEL").update("XHR Path:").insert(el.button.xhr.container);
      el.button.xhr.textbox = new lib.element("INPUT").event.addListener("keydown",listen.xhrTextbox).insert(el.button.xhr.container);
      el.button.xhr.watch = new lib.element("A").attribute.addClass("Button").event.addListener("click",listen.addXhrObject).update("Watch").insert(el.button.xhr.container);

      /*
       * settings
       */
      el.settings = {};
      el.settings.container = new lib.element("DIV").child.add(
        new lib.element("DIV").attribute.addClass("Header").child.add(
          new lib.element().attribute.addClass("Title").update('Firebug Lite Settings')
        )
      ).attribute.addClass("SettingsDiv").insert(el.main);
      el.settings.content = new lib.element("DIV").attribute.addClass("Content").insert(el.settings.container);
      el.settings.progressDiv = new lib.element("DIV").attribute.addClass("ProgressDiv").insert(el.settings.content);
      el.settings.progress = new lib.element("DIV").attribute.addClass("Progress").insert(el.settings.progressDiv);
      el.settings.cbxDebug = new lib.element("INPUT").attribute.set("type","checkbox").attribute.addClass("SettingsCBX").insert(el.settings.content);
      el.settings.content.child.add(document.createTextNode("Start visible"));
      new lib.element("BR").insert(el.settings.content);
      el.settings.cbxDetectFirebug = new lib.element("INPUT").attribute.set("type","checkbox").attribute.addClass("SettingsCBX").insert(el.settings.content);
      el.settings.content.child.add(document.createTextNode("Hide when Firebug active"));
      new lib.element("BR").insert(el.settings.content);
      el.settings.cbxHideDOMFunctions = new lib.element("INPUT").attribute.set("type","checkbox").attribute.addClass("SettingsCBX").insert(el.settings.content);
      el.settings.content.child.add(document.createTextNode("Hide DOM functions"));
      new lib.element("BR").insert(el.settings.content);
      el.settings.cbxOverride = new lib.element("INPUT").attribute.set("type","checkbox").attribute.addClass("SettingsCBX").insert(el.settings.content);
      el.settings.content.child.add(document.createTextNode("Override window.console"));
      new lib.element("BR").insert(el.settings.content);
      el.settings.cbxShowIcon = new lib.element("INPUT").attribute.set("type","checkbox").attribute.addClass("SettingsCBX").insert(el.settings.content);
      el.settings.content.child.add(document.createTextNode("Show icon when hidden"));
      new lib.element("BR").insert(el.settings.content);
      el.settings.cbxOpenInPopup = new lib.element("INPUT").attribute.set("type","checkbox").attribute.addClass("SettingsCBX").insert(el.settings.content);
      el.settings.content.child.add(document.createTextNode("Open in popup"));
      new lib.element("BR").insert(el.settings.content);
      el.settings.content.child.add(document.createTextNode("Trim textnode to "));
      el.settings.textNodeChars = new lib.element("INPUT").attribute.set("type","text").attribute.addClass("SettingsTextbox").insert(el.settings.content);
      el.settings.content.child.add(document.createTextNode(" chars"));
      el.settings.buttonDiv = new lib.element("DIV").insert(el.settings.content);
      el.settings.buttonLeftDiv = new lib.element("DIV").attribute.addClass("ButtonsLeft").insert(el.settings.buttonDiv);
      el.settings.resetButton = new lib.element("INPUT").attribute.set("type","button").update("Reset").event.addListener("click",settings.reset).insert(el.settings.buttonLeftDiv);
      el.settings.buttonRightDiv = new lib.element("DIV").attribute.addClass("ButtonsRight").insert(el.settings.buttonDiv);
      el.settings.cancelButton = new lib.element("INPUT").attribute.set("type","button").update("Cancel").event.addListener("click",settings.hide).insert(el.settings.buttonRightDiv);
      el.settings.buttonRightDiv.child.add(document.createTextNode(" "));
      el.settings.saveButton = new lib.element("INPUT").attribute.set("type","button").update("Save").event.addListener("click",settings.saveClicked).insert(el.settings.buttonRightDiv);

      lib.util.AddEvent(document,"mousemove",listen.mouse)("mousemove",win.resizer.resize)("mouseup",win.resizer.stop)("keydown",listen.keyboard);

      internal.init = true;

      for(var i=0, len=d.console.cache.length; i<len; i++){
        var item = d.console.cache[i];
        d.console.cmd[item.command].apply(window,item.arg);
      };

      if(lib.env.ie6){
        window.onscroll = lib.util.Curry(win.setVerticalPosition,window,null);
        var buttons = [
          el.button.inspect,
          el.button.close,
          el.button.inspect,
          el.button.console.clear,
          el.right.console.run,
          el.right.console.clear,
          el.right.css.run,
          el.right.css.clear
          ];
        for(var i=0, len=buttons.length; i<len; i++)
          buttons[i].attribute.set("href","#");
        win.refreshSize();
      }
     
      if(env.showIconWhenHidden) {
        if(!internal.popupWin) {
          el.firebugIcon.environment.addStyle({ "display": env.debug&&'none'||'block' });
        }
      }

      lib.util.AddEvent(window, "unload", win.unload);

      if (internal.isPopup) {
        env.height=lib.util.GetViewport().height;
        lib.util.AddEvent(window, "resize", win.fitToPopup);
        win.fitToPopup();
      } else {
        lib.util.AddEvent(window, "resize", win.refreshSize);
      }

      win.setHeight(env.height);

      if(env.openInPopup&&!internal.isPopup) {
        win.newWindow();
      } else {
        el.main.environment.addStyle({ "display":env.debug&&'block'||'none' });
        el.mainiframe.environment.addStyle({ "display":env.debug&&'block'||'none' });
      }
    }  
  },
  inspect:function(){
    return firebug.d.html.inspect.apply(window,arguments);
  },
  watchXHR:function(){
    with(firebug){
      d.xhr.addObject.apply(window,arguments);
      if(env.dIndex!="xhr"){
        d.navigate("xhr");
      }
    }
  },
  settings:{
    isVisible:false,
    show: function() {
      with(firebug){
        var posXY=lib.util.Element.getPosition(firebug.el.nav.options.element);
        settings.refreshForm();

        el.settings.container.environment.addStyle({
          "display": "block",
          "left": (posXY.offsetLeft-107)+"px"
        });
        el.settings.progressDiv.environment.addStyle({
          "display": "none"
        });
        firebug.settings.isVisible = true;
      }
    },
    hide: function() {
      with(firebug){
        firebug.el.settings.container.environment.addStyle({
          "display": "none"
        });
        firebug.settings.isVisible = false;
      }
    },
    toggle: function(){
      with(firebug){
        settings[!settings.isVisible && 'show' || 'hide']();
      }
    },
    saveClicked: function() {
      firebug.el.settings.progressDiv.environment.addStyle({
        "display": "block"
      });
      setTimeout(firebug.settings.formToSettings,0);
    },
    formToSettings: function() {
      var fe=firebug.env,
        ofe,
        elSet=firebug.el.settings,
        exdate;

      fe.debug=elSet.cbxDebug.element.checked;
      fe.detectFirebug=elSet.cbxDetectFirebug.element.checked;
      fe.hideDOMFunctions=elSet.cbxHideDOMFunctions.element.checked;
      fe.override=elSet.cbxOverride.element.checked;
      fe.showIconWhenHidden=elSet.cbxShowIcon.element.checked;
      fe.openInPopup=elSet.cbxOpenInPopup.element.checked;
      
      if(isFinite(elSet.textNodeChars.element.value)&&elSet.textNodeChars.element.value>0) {
        fe.textNodeChars=elSet.textNodeChars.element.value;
      } else {
        fe.textNodeChars=0;
      }

      if(firebug.internal.isPopup) {
        window.opener.firebug.env = firebug.lib.util.Hash.clone(fe);
      }

      with(firebug) {
        settings.writeCookie();
        settings.hide();
        win.refreshDOM();
        d.html.openHtmlTree();
        if(internal.isPopup) {
          with(opener.firebug) {
            win.refreshDOM();
            d.html.openHtmlTree();
          }
        }
      }
    },
    reset: function() {
      var exdate=new Date();

      exdate.setTime(exdate.getTime()-1);
      document.cookie='FBLiteSettings=;expires='+exdate.toGMTString();
      location.reload(true);
    },
    readCookie: function() {
      var i,cookieArr,valueArr,item,value;

      with(firebug.env){
        if(firebug.internal.targetWindow.document.cookie.length>0) {
          cookieArr=firebug.internal.targetWindow.document.cookie.split('; ');
          
          for(i=0;i<cookieArr.length;i++) {
            if(cookieArr[i].split('=')[0]=='FBLiteSettings') {
              valueArr=cookieArr[i].split('=')[1].split(',');
            }
          }

          if(valueArr) {
            for(i=0;i<valueArr.length;i++) {
              item=valueArr[i].split(':')[0];
              value=valueArr[i].split(':')[1];
              
              switch(item) {
                case 'debug':
                  debug=value=="true";
                  break;
                case 'detectFirebug':
                  detectFirebug=value=="true";
                  break;
                case 'hideDOMFunctions':
                  hideDOMFunctions=value=="true";
                  break;
                case 'override':
                  override=value=="true";
                  break;
                case 'showIconWhenHidden':
                  showIconWhenHidden=value=="true";
                  break;
                case 'openInPopup':
                  openInPopup=value=="true";
                  break;
                case 'textNodeChars':
                  textNodeChars=isFinite(value)?parseInt(value,10):0;
                  break;
                case 'popupTop':
                  popupTop=parseInt(value,10);
                  break;
                case 'popupLeft':
                  popupLeft=parseInt(value,10);
                  break;
                case 'popupWidth':
                  popupWidth=parseInt(value,10);
                  break;
                case 'popupHeight':
                  popupHeight=parseInt(value,10);
                  break;
                case 'height':
                  height=parseInt(value,10);
                  break;
              }
            }
          }
        }
      }
    },
    writeCookie: function() {
      var values;
      
      with(firebug.env){
        values='debug:'+debug+',';
        values+='detectFirebug:'+detectFirebug+',';
        values+='hideDOMFunctions:'+hideDOMFunctions+',';
        values+='override:'+override+',';
        values+='showIconWhenHidden:'+showIconWhenHidden+',';
        values+='openInPopup:'+openInPopup+',';
        values+='textNodeChars:'+textNodeChars+',';

        if(firebug.internal.isPopup) {
          if(window.outerWidth===undefined) {
            values+='popupTop:'+(window.screenTop-56)+',';
            values+='popupLeft:'+(window.screenLeft-8)+',';
            values+='popupWidth:'+document.body.clientWidth+',';
            values+='popupHeight:'+document.body.clientHeight+',';
          } else {
            values+='popupTop:'+window.screenY+',';
            values+='popupLeft:'+window.screenX+',';
            values+='popupWidth:'+window.outerWidth+',';
            values+='popupHeight:'+window.outerHeight+',';
          }
        } else {
          values+='popupTop:'+popupTop+',';
          values+='popupLeft:'+popupLeft+',';
          values+='popupWidth:'+popupWidth+',';
          values+='popupHeight:'+popupHeight+',';
        }
        
        values+='height:'+(parseInt(firebug.internal.targetWindow.firebug.el.main.element.style.height.replace(/px/,''),10)-38);

        exdate=new Date();
        exdate.setDate(exdate.getDate()+365);
        firebug.internal.targetWindow.document.cookie='FBLiteSettings='+values+';expires='+exdate.toGMTString();
      }
    },
    refreshForm: function() {
      var fe=firebug.env,
          elSet=firebug.el.settings;

      elSet.cbxDebug.element.checked=fe.debug;
      elSet.cbxDetectFirebug.element.checked=fe.detectFirebug;
      elSet.cbxHideDOMFunctions.element.checked=fe.hideDOMFunctions;
      elSet.cbxOverride.element.checked=fe.override;
      elSet.cbxShowIcon.element.checked=fe.showIconWhenHidden;
      elSet.cbxOpenInPopup.element.checked=fe.openInPopup;
      elSet.textNodeChars.element.value=fe.textNodeChars;
    }
  },
  win:{
    hide:function(){
      with(firebug){
        el.main.environment.addStyle({
          "display": "none"
        });
        el.mainiframe.environment.addStyle({
          "display": "none"
        });
        if(env.showIconWhenHidden) {
          el.firebugIcon.environment.addStyle({
            "display": "block"
          });
        }
      }
    },
    show:function(){
      with(firebug){
        el.main.environment.addStyle({
          "display": "block"
        });
        el.mainiframe.environment.addStyle({
          "display": "block"
        });
        if(env.showIconWhenHidden) {
          el.firebugIcon.environment.addStyle({
            "display": "none"
          });
        }
      }
    },
    iconClicked:function(_event) {
        with(firebug) {
            if(_event.ctrlKey==true||_event.metaKey==true) {
                el.firebugIcon.environment.addStyle({ "display": "none" });
                env.showIconWhenHidden=false;
            } else {
                win.show();
            }
        }
    },
    minimize:function(){
      with(firebug){
        internal.minimized=true;
        el.main.environment.addStyle({ "height":"35px" });
        el.mainiframe.environment.addStyle({ "height":"35px" });
        el.button.maximize.environment.addStyle({ "display":"block" });
        el.button.minimize.environment.addStyle({ "display":"none" });
        win.refreshSize();
      }
    },
    maximize:function(){
      with(firebug){
        internal.minimized=false;
        el.button.minimize.environment.addStyle({ "display":"block" });
        el.button.maximize.environment.addStyle({ "display":"none" });
        win.setHeight(env.height);
      }
    },
    newWindow: function() {
      var interval,scripts,script,scriptPath,
          fe=firebug.env,
          fi=firebug.internal;

      if (!fi.popupWin) {
        scripts = document.getElementsByTagName('script');
        
        fi.popupWin = window.open("", "_firebug", 
          "status=0,menubar=0,resizable=1,top="+fe.popupTop+",left="+fe.popupLeft+",width=" + fe.popupWidth + 
          ",height=" + fe.popupHeight + ",scrollbars=0,addressbar=0,outerWidth="+fe.popupWidth+",outerHeight="+fe.popupHeight+
          "toolbar=0,location=0,directories=0,dialog=0");
        
        if(!fi.popupWin) {
          alert("Firebug Lite could not open a pop-up window, most likely because of a popup blocker.\nPlease enable popups for this domain");
        } else {
          firebug.settings.hide();

          for (i=0,len=scripts.length; i<len; i++) {
            if (scripts[i].src.indexOf(fi.liteFilename) > -1) {
              scriptPath = scripts[i].src;
              break;
            }
          }

          if (scriptPath) {
            done = false;
            script = fi.popupWin.document.createElement('script');
            script.type = 'text/javascript';
            script.src = scriptPath;

            script[firebug.lib.env.ie?"onreadystatechange":"onload"] = function(){
              if(!done && (!firebug.lib.env.ie || this.readyState == "complete" || this.readyState=="loaded")){
                done = true;
                if(fi.popupWin.firebug) {
                  with(fi.popupWin.firebug) {
                    internal.isPopup = true;
                    env.css = fe.css;
                    init();
                    el.button.dock.environment.addStyle({ "display": "block"});
                    el.button.newWindow.environment.addStyle({ "display": "none"});
                  }
                }
              }
            };

            if (!done && firebug.lib.env.webkit) {
              interval = setInterval(function() {
                if (firebug.internal.popupWin.firebug) {
                  clearInterval(interval);
                  done = true;
                  with(firebug.internal.popupWin.firebug) {
                    internal.isPopup = true;
                    env.css = fe.css;
                    init();
                    el.button.dock.environment.addStyle({ "display": "block"});
                    el.button.newWindow.environment.addStyle({ "display": "none"});
                  }
                }
              }, 10);
            };

            if(!firebug.lib.env.ie) {
              firebug.internal.popupWin.document.write('<html><head><title>Firebug Lite - '+document.location.href+'</title></head><body></body></html>');
            }
            if (!done) {
              firebug.internal.popupWin.document.getElementsByTagName('head')[0].appendChild(script);
              firebug.el.main.environment.addStyle({"display": "none"});
              firebug.el.mainiframe.environment.addStyle({"display": "none"});
            }
          } else {
            alert("Unable to detect the following script \"" + firebug.internal.liteFilename +
                  "\" ... if the script has been renamed then please set the value of firebug.internal.liteFilename to reflect this change");
            firebug.internal.popupWin.close();
            firebug.internal.popupWin=null;
          }
        }
      }
    },
    dock: function() {
      with(opener.firebug) {
        internal.popupWin = null;
        el.main.environment.addStyle({
          "display": "block"
        });
        el.mainiframe.environment.addStyle({
          "display": "block"
        });
        settings.readCookie();
        window.close();
      };
    },
    unload: function() {
      with(firebug){
        if(internal.isPopup) {
          win.dock();
        } else if(internal.popupWin) {
          internal.popupWin.close();
        }
      }
    },
    fitToPopup: function() {
      with(firebug) {
        var viewport = lib.util.GetViewport(window);
        win.setHeight((window.innerHeight||viewport.height) - 38);
        el.main.environment.addStyle({
          "width": (viewport.width) + "px"
        });
        el.mainiframe.environment.addStyle({
          "width": (viewport.width) + "px"
        });
      }
    },
    resizer:{
      y:[], enabled:false,
      start:function(_event){
        with(firebug){
          if(internal.minimized)return;
          win.resizer.y=[el.main.element.offsetHeight,_event.clientY];
          if(lib.env.ie6){
            win.resizer.y[3]=parseInt(el.main.environment.getPosition().top);
          }
          win.resizer.enabled=true;
        }
      },
      resize:function(_event){
        with(firebug){
          if(!win.resizer.enabled)return;
          win.resizer.y[2]=(win.resizer.y[0]+(win.resizer.y[1]-_event.clientY));
          el.main.environment.addStyle({ "height":win.resizer.y[2]+"px" });
          el.mainiframe.environment.addStyle({ "height":win.resizer.y[2]+"px" });
          if(lib.env.ie6){
            el.main.environment.addStyle({ "top":win.resizer.y[3]-(win.resizer.y[1]-_event.clientY)+"px" });
            el.mainiframe.environment.addStyle({ "top":win.resizer.y[3]-(win.resizer.y[1]-_event.clientY)+"px" });
          }
        }
      },
      stop:function(_event){
        with(firebug){
          if(win.resizer.enabled){
            win.resizer.enabled=false;
            win.setHeight(win.resizer.y[2]-35);
          }
        }
      }
    },
    setHeight:function(_height){
      with(firebug){
        env.height=_height;

        el.left.container.environment.addStyle({ "height":_height+"px" });
        el.right.container.environment.addStyle({ "height":_height+"px" });
        el.main.environment.addStyle({ "height":_height+38+"px" });
        el.mainiframe.environment.addStyle({ "height":_height+38+"px" });

        win.refreshSize();

        // console
        el.left.console.monitor.element.parentNode.style.height=_height-47+"px";
        el.left.console.mlButton.environment.addStyle({ "top":_height+19+"px" });
        el.right.console.mlButton.environment.addStyle({ "top":_height+19+"px" });
        el.right.console.input.environment.addStyle({ "height":_height-29+"px" });

        // html
        el.left.html.container.environment.addStyle({"height":_height-23+"px"});
        el.right.html.content.environment.addStyle({"height":_height-23+"px"});

        // css
        el.left.css.container.environment.addStyle({"height":_height-33+"px"});
        el.right.css.input.environment.addStyle({ "height":_height-55+"px" });

        // script
        el.left.scripts.container.environment.addStyle({"height":_height-23+"px"});

        // dom
        el.left.dom.container.environment.addStyle({"height":_height-31+"px"});

        // xhr
        el.left.xhr.container.environment.addStyle({"height":_height-32+"px"});

        // string
        el.left.str.container.environment.addStyle({"height":_height-32+"px"});
      }
    },
    refreshDOM:function(){
      with(firebug){
        d.dom.open(eval(el.button.dom.textbox.environment.getElement().value),el.left.dom.container);
        if(d.html.nIndex=="dom"){
          firebug.d.html.navigate("dom")
        }
      }
    },
    refreshSize:function(){
      with(firebug){
        if(!internal.init)
          return;

        var dim = lib.util.GetViewport();
        el.main.environment.addStyle({ "width":dim.width+"px"});
        el.mainiframe.environment.addStyle({ "width":dim.width+"px"});
        if(lib.env.ie6)
          win.setVerticalPosition(dim);
      }
    },
    setVerticalPosition:function(_dim,_event){
      with(firebug){
        var dim = _dim||lib.util.GetViewport();
        el.main.environment.addStyle({ "top":dim.height-el.main.environment.getSize().offsetHeight+Math.max(document.documentElement.scrollTop,document.body.scrollTop)+"px" });
        el.mainiframe.environment.addStyle({ "top":dim.height-el.main.environment.getSize().offsetHeight+Math.max(document.documentElement.scrollTop,document.body.scrollTop)+"px" });
      }
    }
  },
  d: {
    clean:function(_element){
      with(firebug){
        _element.update("");
      }
    },
    console:{
      addLine:function(){
        with (firebug) {
          return new lib.element("DIV").attribute.addClass("Row").insert(el.left.console.monitor);
        }
      },
      cache:[],
      clear:function(){
        with(firebug){
          d.clean(el.left.console.monitor);
          d.console.cache = [];
        }
      },
      formatArgs:function(){
        with(firebug){
          var content = [];
          for(var i=0, len=arguments.length; i<len; i++){
            content.push( d.highlight(arguments[i],false,false,true) );
          }
          return content.join(" ");
        }
      },
      history:[], historyIndex:0,
      openObject:function(_index){
        with (firebug) {
          d.dom.open(d.console.cache[_index], el.left.dom.container, lib.env.ie);
          d.navigate("dom");
        }
      },
      print: function(_cmd,_text){
        with (firebug){
          d.console.addLine().attribute.addClass("Arrow").update(">>> "+_cmd);
          d.console.addLine().update(d.highlight(_text,false,false,true));
          d.console.scroll();
        }
      },
      printException: function(_exception){
        with(firebug){
          var message = _exception.description||_exception.message||_exception;
          if(_exception.fileName){
            message+=' ('+(_exception.name&&(_exception.name+', ')||'')+getFileName(_exception.fileName)+', '+_exception.lineNumber+')';
          }
          d.console.addLine().attribute.addClass("Error").update("<strong>Error: </strong>"+message,true);
        }
      },
      eval:function(_cmd){
        var result;
        with(firebug){
          if(_cmd.length==0)
            return;

          el.left.console.input.environment.getElement().value = "";
          d.console.historyIndex = d.console.history.push(_cmd);

          try {
            if(_cmd==='console.firebug') {
              d.console.addLine().attribute.addClass("Arrow").update(firebug.version);
            } else {
              result = eval.call(window,_cmd);
              d.console.print(_cmd,result);
            }
          } catch(e){
            d.console.addLine().attribute.addClass("Arrow").update(">>> "+_cmd);
            d.console.printException(e);
          }
          d.console.scroll();
        }
      },
      scroll:function(){
        with(firebug){
          el.left.console.monitor.environment.getElement().parentNode.scrollTop = Math.abs(el.left.console.monitor.environment.getSize().offsetHeight-(el.left.console.monitor.element.parentNode.offsetHeight-11));
        }
      },
      run:function(_command){
        with(firebug){
          if(!internal.init){
            d.console.cache.push({ "command":_command, "arg":Array.prototype.slice.call(arguments,1) });
          } else {
            d.console.cmd[_command].apply(window,Array.prototype.slice.call(arguments,1));
          }
        }
      },
      toggleML:function(){
        with(firebug){
          var open = !env.ml;
          env.ml = !env.ml;
          d.navigateRightColumn("console",open);
          el[open?"left":"right"].console.mlButton.environment.addStyle({ display:"none" });
          el[!open?"left":"right"].console.mlButton.environment.addStyle({ display:"block" });
          el.left.console.mlButton.attribute[(open?"add":"remove")+"Class"]("CloseML");
        }
      },
      countMap:{}, timeMap: {},
      cmd:{
        log: function(_value){
          with(firebug){
            var args = d.console.formatArgs.apply(window,arguments);
            d.console.addLine().attribute.addClass("Log").update(args);
            d.console.scroll();
          }
        },
        warn: function(_value){
          with(firebug){
            var args = d.console.formatArgs.apply(window,arguments);
            d.console.addLine().attribute.addClass("Warn").update(args);
            d.console.scroll();
          }
        },
        info: function(_value){
          with(firebug){
            var args = d.console.formatArgs.apply(window,arguments);
            d.console.addLine().attribute.addClass("Info").update(args);
            d.console.scroll();
          }
        },
        debug: function(_value){
          with(firebug){
            var args = d.console.formatArgs.apply(window,arguments);
            d.console.addLine().attribute.addClass("Debug").update(args);
            d.console.scroll();
          }
        },
        error: function(_value){
          with(firebug){
            var args = d.console.formatArgs.apply(window,arguments);
            d.console.addLine().attribute.addClass("Error").update(args);
            d.console.scroll();
          }
        },
        trace: function(_value){
          with(firebug){
            var stackAmt = 3, f = arguments.caller, isArray = lib.util.IsArray(f); //function that called trace

            if((!isArray&&f)||(isArray&&f.length>0)){
              d.console.addLine().attribute.addClass("Arrow").update(">>> console.trace(stack)");
              for(var i=0;i<stackAmt;i++){
                var func = f.toString(), args = f.arguments;
                d.dom.open({"function":func, "arguments":args},d.console.addLine());
                f = f.caller;
              }
            }
          }
        },
        dir:function(_value){
          with(firebug){
            d.console.addLine().attribute.addClass("Arrow").update(">>> console.dir("+_value+")");
            d.dom.open(_value,d.console.addLine());
          }
        },
        dirxml: function(){
          with(firebug){
            d.console.cmd.log.apply(this, arguments);
          }
        },
        time: function(_name){
          with(firebug){
            d.console.timeMap[_name] = new Date().getTime();
          }
        },
        timeEnd: function(_name){
          with(firebug){
            if(_name in d.console.timeMap){
              var delta = new Date().getTime() - d.console.timeMap[_name],
              args = d.console.formatArgs.apply(window,[_name+":", delta+"ms"]);
              d.console.addLine().attribute.addClass("log").update(args);
              delete d.console.timeMap[_name];
            }
          }
        },
        count: function(_name){
          with(firebug){
            if(!d.console.countMap[_name])
              d.console.countMap[_name] = 0;
            d.console.countMap[_name]++;
            d.console.cmd.log.apply(window, [_name, d.console.countMap[_name]]);
          }
        },
        group:function(){
          with(firebug){
            d.console.cmd.log.apply(this, ["console.group is not supported"]);
          }
        },
        groupEnd:function(){
          with(firebug){
            d.console.cmd.log.apply(this, ["console.groupEnd is not supported"]);
          }
        },
        profile:function(){
          with(firebug){
            d.console.cmd.log.apply(this, ["console.profile is not supported"]);
          }
        },
        profileEnd:function(){
          with(firebug){
            d.console.cmd.log.apply(this, ["console.profileEnd is not supported"]);
          }
        }
      }
    },
    css:{
      index:-1,
      open:function(_index){
        with (firebug) {
          var item = internal.targetWindow.document.styleSheets[_index],
          uri = item.href;
          try {
            var rules = item[lib.env.ie ? "rules" : "cssRules"], str = "";
            for (var i=0; i<rules.length; i++) {
              var item = rules[i];
              var selector = item.selectorText;
              var cssText = lib.env.ie?item.style.cssText:item.cssText.match(/\{(.*)\}/)[1];
              str+=d.css.printRule(selector, cssText.split(";"), el.left.css.container);
            }
          } catch(e) {
            str="<em>Access to restricted URI denied</em>";
          }
          el.left.css.container.update(str);
        }
      },
      printRule:function(_selector,_css,_layer){
        with(firebug){
          var str = "<div class='Selector'>"+_selector+" {</div>";
          for(var i=0,len=_css.length; i<len; i++){
            var item = _css[i];
            str += "<div class='CSSText'>"+item.replace(/(.+\:)(.+)/,"<span class='CSSProperty'>$1</span><span class='CSSValue'>$2;</span>")+"</div>";
          }
          str+="<div class='Selector'>}</div>";
          return str;
        }
      },
      refresh:function(){
        with(firebug){
          el.button.css.selectbox.update("");
          var collection = internal.targetWindow.document.styleSheets;
          for(var i=0,len=collection.length; i<len; i++){
            var uri = getFileName(collection[i].href);
            d.css.index=d.css.index<0?i:d.css.index;
            el.button.css.selectbox.child.add(
                new lib.element("OPTION").attribute.set("value",i).update(uri)
            )
          };
          d.css.open(d.css.index);
        }
      }
    },
    dom: {
      open: function(_object,_layer){
        with (firebug) {
          _layer.clean();
          var container = new lib.element("DIV").attribute.addClass("DOMContent").insert(_layer);
          d.dom.print(_object, container);
        }
      },
      print:function(_object,_parent, _inTree){
        with (firebug) {
          var obj = _object || window, parentElement = _parent;
          parentElement.update("");

          if(parentElement.opened&&parentElement!=el.left.dom.container){
            parentElement.environment.getParent().lib.child.get()[0].lib.child.get()[0].lib.attribute.removeClass("Opened");
            parentElement.opened = false;
            parentElement.environment.addStyle({ "display":"none" });
            return;
          }
          if(_inTree)
            parentElement.environment.getParent().lib.child.get()[0].lib.child.get()[0].lib.attribute.addClass("Opened");
          parentElement.opened = true;

          for (var key in obj) {
            try {
              if (env.hideDOMFunctions && typeof(obj[key]) == "function") continue;
              var value = obj[key], property = key, container = new lib.element("DIV").attribute.addClass("DOMRow").insert(parentElement),
              left = new lib.element("DIV").attribute.addClass("DOMRowLeft").insert(container), right = new lib.element("DIV").attribute.addClass("DOMRowRight").insert(container);

              container.child.add(
                  new lib.element("DIV").attribute.addClass('Clear')
              );

              var link = new lib.element("A").attribute.addClass(
                  typeof value=="object"&&Boolean(value)?"Property Object":"Property"
              ).update(property).insert(left);

              right.update(d.highlight(value,false,true));

              var subContainer = new lib.element("DIV").attribute.addClass("DOMRowSubContainer").insert(container);

              if(typeof value!="object"||Boolean(value)==false)
                continue;

              link.event.addListener("click",lib.util.Curry(d.dom.print,window,value, subContainer, true));
            }catch(e){
            }
          }
          parentElement.environment.addStyle({ "display":"block" });
        }
      }
    },
    highlight:function(_value,_inObject,_inArray,_link){
      with(firebug){
        var isArray = false, isHash, isElement = false, vtype=typeof _value, result=[];

        if(vtype=="object"){
          if(Object.prototype.toString.call(_value) === "[object Date]"){
            vtype = "date";
          } else if(Object.prototype.toString.call(_value) === "[object String]"){
            vtype = "string";
          } else if(Object.prototype.toString.call(_value) === "[object Boolean]"){
            vtype = "boolean";
          } else if(Object.prototype.toString.call(_value) === "[object RegExp]"){
            vtype = "regexp";
          }
        }
        
        try {
          isArray = lib.util.IsArray(_value);
          isHash = lib.util.IsHash(_value);
          isElement = _value!=undefined&&Boolean(_value.nodeName)&&Boolean(_value.nodeType);

          // number, string, boolean, null, function
          if(_value==null||vtype=="number"||vtype=="string"||vtype=="boolean"||(vtype=="function"&&_value.nodeName!="OBJECT")||vtype=="regexp"||vtype=="date"){
            if(_value==null){
              if(_value===undefined) {
                result.push("<span class='Null'>undefined</span>");
              } else {
                result.push("<span class='Null'>null</span>");
              }
            }else if (vtype=="regexp") {
              result.push("<span class='Maroon'>" + _value + "</span>");
            }else if (vtype=="date") {
              result.push("<span class='DarkBlue'>'" + _value + "'</span>");
            } else if (vtype=="boolean"||vtype=="number") {
              result.push("<span class='DarkBlue'>" + _value + "</span>");
            } else if(vtype=="function"){
              result.push("<span class='"+(_inObject?"Italic Gray":"Green")+"'>function()</span>");
            } else {
              result.push("<span class='Red'>\""+( !_inObject&&!_inArray?_value : _value.substring(0,35)+(_value.length>35?" ...":"") ).replace(/\n/g,"\\n").replace(/\s/g,"&nbsp;").replace(/>/g,"&#62;").replace(/</g,"&#60;")+"\"</span>");
            }
          }
          // element
          else if(isElement){

            if(_value.nodeType==3)
              result.push(d.highlight(_value.nodeValue));
            else if(_inObject){
              result.push("<span class='Gray Italic'>"+_value.nodeName.toLowerCase()+"</span>");
            } else {
              result.push("<span class='Blue"+ ( !_link?"'":" ObjectLink' onmouseover='this.className=this.className.replace(\"ObjectLink\",\"ObjectLinkHover\")' onmouseout='this.className=this.className.replace(\"ObjectLinkHover\",\"ObjectLink\")' onclick='firebug.d.html.inspect(firebug.d.console.cache[" +( d.console.cache.push( _value ) -1 )+"])'" ) + "'>");

              if(_inArray){
                result.push(_value.nodeName.toLowerCase());
                if(_value.getAttribute){
                  if(_value.getAttribute&&_value.getAttribute("id"))
                    result.push("<span class='DarkBlue'>#"+_value.getAttribute("id")+"</span>");
                  var elClass = _value.getAttribute(lib.env.ie&&!lib.env.ie8?"className":"class")||"";
                  result.push(!elClass?"":"<span class='Red'>."+elClass.split(" ")[0]+"</span>");
                }
                result.push("</span>");
              } else {
                result.push("<span class='DarkBlue'>&#60;<span class='Blue TagName'>"+ _value.nodeName.toLowerCase());

                if(_value.attributes){
                  for(var i=0,len=_value.attributes.length; i<len; i++){
                    var item = _value.attributes[i];

                    if(!lib.env.ie||item.nodeValue)
                      result.push(" <span class='DarkBlue'>"+item.nodeName+"=\"<span class='Red'>"+item.nodeValue+"</span>\"</span>");
                  }
                }

                result.push("</span>&#62;</span>");
              }
            }
          } 
          // array, hash
          else if(isArray||isHash){
            if(isArray){
              if(_inObject){
                result.push("<span class='Gray Italic'>["+_value.length+"]</span>");
              } else {
                result.push("<span class='Strong'>[ ");

                for(var i=0,len=_value.length; i<len; i++){
                  if((_inObject||_inArray)&&i>3){
                    result.push(", <span class='Strong Gray'>"+(len-4)+" More...</span>");
                    break;
                  }
                  result.push( (i > 0 ? ", " : "") + d.highlight(_value[i], false, true, true) );
                }

                result.push(" ]</span>");
              }
            } else if(_inObject){
              result.push("<span class='Gray Italic'>Object</span>");
            } else {  
              result.push("<span class='Strong Green"+ ( !_link?"'":" ObjectLink' onmouseover='this.className=this.className.replace(\"ObjectLink\",\"ObjectLinkHover\")' onmouseout='this.className=this.className.replace(\"ObjectLinkHover\",\"ObjectLink\")' onclick='firebug.d.console.openObject(" +( d.console.cache.push( _value ) -1 )+")'" ) + ">Object");
              var i=0;
              for(var key in _value){
                var value = _value[key];
                if((_inObject||_inArray)&&i>3){
                  result.push(" <span class='Strong Gray'>More...</span>");
                  break;
                }
                result.push(" "+key+"="+d.highlight(value,true));
                i++;
              }
              result.push("</span>");
            } 
          } else {
            result.push(["<span class'Gray Italic'>"+_value+"</span>"]);
          }
        } catch(e){
          result.push(".."); 
        }
        return result.join("");
      }
    },
    html:{
      nIndex:"computedStyle",
      current:null,
      highlight:function(_element,_clear,_event){
        with(firebug){
          if(_element.firebugElement){
            return;
          }
          if(_clear){
            internal.targetWindow.firebug.el.bgInspector.environment.addStyle({ "display":"none" });
            return;
          }
          d.inspector.inspect(_element,true);
        }
      },
      inspect:function(_element){
        var map = [],
        parentLayer,
        t,
        link,
        tagName,
        searchEl,
        parent = _element;
        while (parent) {
          map.push(parent);
          if (parent == firebug.internal.targetWindow.document.body) break;
          parent = parent.parentNode;
        }
        map = map.reverse();
        with(firebug) {
          if (env.dIndex != "html") {
            internal.targetWindow.firebug.d.navigate("html");
          }

          internal.targetWindow.firebug.d.inspector.toggle(false);

          for (t = 0; t < el.left.html.container.child.get().length; t++) {
            searchEl=el.left.html.container.child.get()[t];
            if(/<body/i.test(searchEl.innerText||searchEl.textContent)) {
              parentLayer = el.left.html.container.child.get()[t].childNodes[1].lib;
              break;
            }
          }

          if (!parentLayer) {
            parentLayer = el.left.html.container.child.get()[3].childNodes[1].lib;
          }

          for (t = 0, len = map.length; map[t]; t++) {
            if (t == len - 1) {
              link = parentLayer.environment.getElement().previousSibling.lib;
              link.attribute.addClass("Selected");
              
              if(link.element.scrollIntoView) {
                link.element.scrollIntoView(false);
              }

              if (d.html.current) {
                d.html.current[1].attribute.removeClass("Selected");
              }
              d.html.current = [_element, link];
              return;
            }
            parentLayer = d.html.openHtmlTree(map[t], parentLayer, map[t + 1]);
          }
        }
      },
      navigate:function(_index,_element){
        with(firebug){
          el.right.html.nav[d.html.nIndex].attribute.removeClass("Selected");
          el.right.html.nav[_index].attribute.addClass("Selected");
          d.html.nIndex = _index;
          d.html.openProperties();
        }
      },
      openHtmlTree:function(_element,_parent,_returnParentElementByElement,_event){
        with(firebug){
          var element = _element || internal.targetWindow.document.documentElement, 
              parent = _parent || el.left.html.container, 
              returnParentEl = _returnParentElementByElement || null, 
              returnParentVal = null,
              len = element.childNodes.length,
              nodeLink;
          
          if (!window.Node) {
            window.Node = {TEXT_NODE:3,COMMENT_NODE:8};
          }
              
          if(parent!=el.left.html.container){
            nodeLink = parent.environment.getParent().lib.child.get()[0].lib;
            if (d.html.current) {
              d.html.current[1].attribute.removeClass("Selected");
            }
            nodeLink.attribute.addClass("Selected");

            d.html.current = [_element,nodeLink];
            d.html.openProperties();
          };

          if(element.childNodes&&(len==0||(len==1&&element.childNodes[0].nodeType==Node.TEXT_NODE)))return;
          parent.clean();

          if(parent.opened&&Boolean(_returnParentElementByElement)==false){
            parent.opened = false;
            parent.element.previousSibling.lib.attribute.removeClass("Open");
            parent.element.lib.attribute.removeClass("OpenSubContainer");
            return;
          };

          if (parent != el.left.html.container) {
            parent.element.previousSibling.lib.attribute.addClass("Open");
            parent.element.lib.attribute.addClass("OpenSubContainer");
            parent.opened = true;
          };

          if(element==document.documentElement){
            new lib.element("A").attribute.addClass("Block").update("<span class='DarkBlue'>&#60;<span class='Blue'>html</span>&#62;").insert(parent);
          };

          for(var i=0; i<=len; i++){
            if(i==len){
              new lib.element("A").attribute.addClass("Block").update("<span class='DarkBlue'>&#60;/<span class='Blue'>"+element.nodeName.toLowerCase()+"</span>&#62;").insert(container);
              break;
            } 
            var item = element.childNodes[i];

            if (item.nodeType != Node.TEXT_NODE && !item.getAttribute('firebugIgnore')){
              var container = new lib.element().attribute.addClass("Block").insert(parent), 
                  link = new lib.element("A").attribute.addClass("Link").insert(container), 
                  spacer = new lib.element("SPAN").attribute.addClass("Spacer").update("&nbsp;").insert(link),
                  html = new lib.element("SPAN").attribute.addClass("Content").update(d.highlight(item)).insert(link),
                  subContainer = new lib.element("DIV").attribute.addClass("SubContainer").insert(container),
                  view;

              if(item.nodeType == Node.COMMENT_NODE) {
                continue;
              }
              
              view = lib.util.Element.getView(item);
              link.event.addListener("click", lib.util.Curry(d.html.openHtmlTree, window, item, subContainer, false));
              link.event.addListener("mouseover", lib.util.Curry(d.html.highlight, window, item, false));
              link.event.addListener("mouseout", lib.util.Curry(d.html.highlight, window, item, true));
                            
              returnParentVal = returnParentEl == item ? subContainer : returnParentVal;
    
              if(d.html.current==null&&item==document.body){
                link.attribute.addClass("Selected");
                link.attribute.addClass("Parent");
                d.html.current = [item,link];
                d.html.openHtmlTree(item,subContainer);
              }

              if(element.nodeName!="HEAD"&&element!=document.documentElement&&(view.visibility=="hidden"||view.display=="none")){
                container.attribute.addClass("Unvisible");
              };

              if (item.childNodes){
                var childLen = item.childNodes.length;
                if (childLen == 1 && item.childNodes[0].nodeType == Node.TEXT_NODE) {
                  if(isFinite(env.textNodeChars)&&parseInt(env.textNodeChars)>0) {
                    html.child.add(document.createTextNode(item.childNodes[0].nodeValue.substring(0, env.textNodeChars)));
                  } else {
                    html.child.add(document.createTextNode(item.childNodes[0].nodeValue));
                  }
                  html.child.add(document.createTextNode("</"));
                  html.child.add(new lib.element("span").attribute.addClass("Blue").update(item.nodeName.toLowerCase()).environment.getElement());
                  html.child.add(document.createTextNode(">"));
                  continue;
                }
                else if (childLen > 0) {
                  link.attribute.addClass("Parent");
                }
              }
            }
          };
          return returnParentVal;
        }
      },
      openProperties:function(){
        with(firebug){
          var index = d.html.nIndex;
          var node = d.html.current[0];
          d.clean(el.right.html.content);
          var str = "";
          switch(index){
            case "computedStyle":
              var property = ["opacity","filter","azimuth","background","backgroundAttachment","backgroundColor","backgroundImage","backgroundPosition","backgroundRepeat","border","borderCollapse","borderColor","borderSpacing","borderStyle","borderTop","borderRight","borderBottom","borderLeft","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","borderTopStyle","borderRightStyle","borderBottomStyle","borderLeftStyle","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth","borderWidth","bottom","captionSide","clear","clip","color","content","counterIncrement","counterReset","cue","cueAfter","cueBefore","cursor","direction","display","elevation","emptyCells","cssFloat","font","fontFamily","fontSize","fontSizeAdjust","fontStretch","fontStyle","fontVariant","fontWeight","height","left","letterSpacing","lineHeight","listStyle","listStyleImage","listStylePosition","listStyleType","margin","marginTop","marginRight","marginBottom","marginLeft","markerOffset","marks","maxHeight","maxWidth","minHeight","minWidth","orphans","outline","outlineColor","outlineStyle","outlineWidth","overflow","padding","paddingTop","paddingRight","paddingBottom","paddingLeft","page","pageBreakAfter","pageBreakBefore","pageBreakInside","pause","pauseAfter","pauseBefore","pitch","pitchRange","playDuring","position","quotes","richness","right","size","speak","speakHeader","speakNumeral","speakPunctuation","speechRate","stress","tableLayout","textAlign","textDecoration","textIndent","textShadow","textTransform","top","unicodeBidi","verticalAlign","visibility","voiceFamily","volume","whiteSpace","widows","width","wordSpacing","zIndex"].sort();
              var view = document.defaultView?document.defaultView.getComputedStyle(node,null):node.currentStyle;
              for(var i=0,len=property.length; i<len; i++){
                var item = property[i];
                if(!view[item])continue;
                str+="<div class='CSSItem'><div class='CSSProperty'>"+item+"</div><div class='CSSValue'>"+d.highlight(view[item])+"</div></div>";
              }
              el.right.html.content.update(str);
              break;
            case "dom":
              d.dom.open(node,el.right.html.content,lib.env.ie);
              break;
          }
        }
      }
    },
    inspector:{
      enabled:false,
      el:null,
      inspect:function(_element,_bgInspector){
        with(firebug){
          var pos = internal.targetWindow.firebug.lib.util.Element.getPosition(_element);

          internal.targetWindow.firebug.el[_bgInspector&&"bgInspector"||"borderInspector"].environment.addStyle({ 
            "width":_element.offsetWidth+"px", "height":_element.offsetHeight+"px",
            "top":pos.offsetTop-(_bgInspector?0:2)+"px", "left":pos.offsetLeft-(_bgInspector?0:2)+"px",
            "display":"block"
          });

          if(!_bgInspector){
            d.inspector.el = _element;
          }
        };
      },
      toggle:function(_absoluteValue,_event){
        with (firebug) {
          if(_absoluteValue==d.inspector.enabled)
            return;
          d.inspector.enabled = _absoluteValue!=undefined&&!_absoluteValue.clientX?_absoluteValue:!d.inspector.enabled;
          el.button.inspect.attribute[(d.inspector.enabled ? "add" : "remove") + "Class"]("Enabled");
          if(d.inspector.enabled==false){
            el.borderInspector.environment.addStyle({ "display":"none" });
            d.inspector.el = null;
          } else if(lib.env.dIndex!="html") {
            if (internal.popupWin) {
              internal.popupWin.firebug.d.navigate("html");
            } else {
              d.navigate("html");
            }
          }
        }
      }
    },
    scripts:{
      index:-1,
      lineNumbers:false,
      open:function(_index){
        with(firebug){
          d.scripts.index = _index;
          el.left.scripts.container.update("");
          var i=0,script = document.getElementsByTagName("script")[_index],uri = script.src||document.location.href,source;
          try {
            if(uri!=document.location.href){
              source = internal.cache[uri]||lib.xhr.get(uri).responseText;
              internal.cache[uri] = source;
            } else {
              source = script.innerHTML;
            }
            source = source.replace(/<|>/g,function(_ch){
              return ({"<":"&#60;",">":"&#62;"})[_ch];
            });
            
            if(d.scripts.lineNumbers){
              source = source.replace(/(^)|\n/g,function(_ch){
                i++;
                return "\n"+i+" ";
              });
            }

            el.left.scripts.container.update(source);
          } catch(e){
            el.left.scripts.container.child.add(
              new lib.element("DIV").attribute.addClass("CodeContainer").update("<em>Access to restricted URI denied</em>")
            );
          }
        }
      },
      toggleLineNumbers:function(){
        with(firebug){
          d.scripts.lineNumbers = !d.scripts.lineNumbers;
          el.button.scripts.lineNumbers.attribute[(d.scripts.lineNumbers ? "add" : "remove") + "Class"]("Enabled");
          d.scripts.open( d.scripts.index );
        }
      },
      refresh:function(){
        with(firebug){
          el.button.scripts.selectbox.clean();
          var collection = internal.targetWindow.document.getElementsByTagName("script");
          for(var i=0,len=collection.length; i<len; i++){
            var item = collection[i],
            fileName = getFileName(item.src||item.baseURI||"..");
            d.scripts.index=d.scripts.index<0?i:d.scripts.index;
            el.button.scripts.selectbox.child.add(
                new lib.element("OPTION").attribute.set("value",i).update(fileName)
            );
          }
          d.scripts.open( d.scripts.index );
        }
      }
    },
    str: {
      open:function(_str){
        with(firebug){
          d.navigate("str");
          el.left.str.container.update(_str.replace(/\n/g,"<br />"))
        }
      }
    },
    xhr:{
      objects:[],
      addObject:function(){
        with(firebug){
          for(var i=0,len=arguments.length; i<len; i++){
            try {
              var item = arguments[i],
                  val = internal.targetWindow.eval(item);
              d.xhr.objects.push([item, val]);
            } catch(e){
              continue;
            }
          }
        }
      },
      open:function(){
        with(firebug){
          el.left.xhr.container.update("");
          el.left.xhr.name = new lib.element("DIV").attribute.addClass("BlockContent").insert(new lib.element("DIV").attribute.addClass("Block").environment.addStyle({ "width":"20%" }).insert(el.left.xhr.container));
          el.left.xhr.nameTitle = new lib.element("STRONG").update("Object Name:").insert(el.left.xhr.name);
          el.left.xhr.nameContent = new lib.element("DIV").insert(el.left.xhr.name);
          el.left.xhr.status = new lib.element("DIV").attribute.addClass("BlockContent").insert(new lib.element("DIV").attribute.addClass("Block").environment.addStyle({ "width":"10%" }).insert(el.left.xhr.container));
          el.left.xhr.statusTitle = new lib.element("STRONG").update("Status:").insert(el.left.xhr.status);
          el.left.xhr.statusContent = new lib.element("DIV").insert(el.left.xhr.status);
          el.left.xhr.readystate = new lib.element("DIV").attribute.addClass("BlockContent").insert(new lib.element("DIV").environment.addStyle({ "width":"15%" }).attribute.addClass("Block").insert(el.left.xhr.container));
          el.left.xhr.readystateTitle =el.left.xhr.nameTitle = new lib.element("STRONG").update("Ready State:").insert(el.left.xhr.readystate);
          el.left.xhr.readystateContent = new lib.element("DIV").insert(el.left.xhr.readystate);
          el.left.xhr.response = new lib.element("DIV").attribute.addClass("BlockContent").insert(new lib.element("DIV").environment.addStyle({ "width":(lib.env.ie?"50":"55")+"%" }).attribute.addClass("Block").insert(el.left.xhr.container));
          el.left.xhr.responseTitle = new lib.element("STRONG").update("Response:").insert(el.left.xhr.response);
          el.left.xhr.responseContent = new lib.element("DIV").insert(el.left.xhr.response);
          setTimeout(d.xhr.refresh,500);
        }
      },
      refresh:function(){
        with(firebug){
          el.left.xhr.nameContent.update("");
          el.left.xhr.statusContent.update("");
          el.left.xhr.readystateContent.update("");
          el.left.xhr.responseContent.update("");
          for(var i=0,len=d.xhr.objects.length; i<len; i++){
            var item = d.xhr.objects[i],
                response = item[1].responseText;
            if(Boolean(item[1])==false)continue;
            el.left.xhr.nameContent.child.add(new lib.element("span").update(item[0]));
            try {
              el.left.xhr.statusContent.child.add(new lib.element("span").update(item[1].status));
            } catch(e){ el.left.xhr.statusContent.child.add(new lib.element("span").update("&nbsp;")); }
            el.left.xhr.readystateContent.child.add(new lib.element("span").update(item[1].readyState));

            el.left.xhr.responseContent.child.add(new lib.element("span").child.add(
                new lib.element("A").event.addListener("click",lib.util.Curry(d.str.open,window,response)).update("&nbsp;"+response.substring(0,50))
            ));
          };
          if(env.dIndex=="xhr")
            setTimeout(d.xhr.refresh,500);
        }
      }
    },
    navigateRightColumn:function(_index,_open){
      with(firebug){
        el.left.container.environment.addStyle({ "width":_open?"70%":"100%" });
        el.right.container.environment.addStyle({ "display":_open?"block":"none" });
      }
    },
    navigate:function(_index){
      with(firebug){
        var open = _index, close = env.dIndex;
        env.dIndex = open;

        settings.hide();

        el.button[close].container.environment.addStyle({ "display":"none" });
        el.left[close].container.environment.addStyle({ "display":"none" });
        el.right[close].container.environment.addStyle({ "display":"none" });

        el.button[open].container.environment.addStyle({ "display":"inline" });
        el.left[open].container.environment.addStyle({ "display":"block" });
        el.right[open].container.environment.addStyle({ "display":"block" });

        if(el.nav[close])
          el.nav[close].attribute.removeClass("Selected");
        if(el.nav[open])
          el.nav[open].attribute.addClass("Selected");

        switch(open){
          case "console":
            d.navigateRightColumn(_index);
            break;
          case "html":
            d.navigateRightColumn(_index,true);
            if(!d.html.current){
              var t=Number(new Date);
              d.html.openHtmlTree();
            }
            break;
          case "css":
            d.navigateRightColumn(_index,true);
            d.css.refresh();
            break;
          case "scripts":
            d.navigateRightColumn(_index);
            d.scripts.refresh();
            break;
          case "dom":
            d.navigateRightColumn(_index);
            if(el.left.dom.container.environment.getElement().innerHTML==""){
              var t=Number(new Date);
              d.dom.open(eval(el.button.dom.textbox.environment.getElement().value),el.left.dom.container);
            }
            break;
          case "xhr":
            d.navigateRightColumn(_index);
            d.xhr.open();
            break;
        }
      }
    }
  },
  getFileName:function(_path){
    var match = _path&&_path.match(/[\w\-\.\?\=\&]+$/);
    return match&&match[0]||_path;
  },
  cancelEvent:function(_event){
    if(_event.stopPropagation)
      _event.stopPropagation();
    if(_event.preventDefault)
      _event.preventDefault();
  },
  getSelection:function(_el){
    with(firebug){
      if(lib.env.ie){
        var range = document.selection.createRange(),stored = range.duplicate();
        stored.moveToElementText(_el);
        stored.setEndPoint('EndToEnd', range);
        _el.selectionStart = stored.text.length - range.text.length;
        _el.selectionEnd = _el.selectionStart + range.text.length;
      }
      return {
        start:_el.selectionStart,
        length:_el.selectionEnd-_el.selectionStart
      }
    }
  },
  tab:function(_el,_event){
    with(firebug){
      if(_event.keyCode==9){
        if(_el.setSelectionRange){
          var position = firebug.getSelection(_el);
          _el.value = _el.value.substring(0,position.start) + String.fromCharCode(9) + _el.value.substring(position.start+position.length,_el.value.length);
          _el.setSelectionRange(position.start+1,position.start+1);
        } else if(document.selection) {  
          var range = document.selection.createRange(), isCollapsed = range.text == '';
          range.text = String.fromCharCode(9);
          range.moveStart('character', -1);
        }
        firebug.cancelEvent(_event);
        if(lib.env.ie)
          setTimeout(_el.focus,100);
      };
    }
  },
  listen: {
    addXhrObject:function(){
      with(firebug){
        d.xhr.addObject.apply(internal.targetWindow, el.button.xhr.textbox.environment.getElement().value.split(","));
      }
    },
    consoleTextbox:function(_event){
      with(firebug){
        if(_event.keyCode==13&&(env.multilinemode==false||_event.shiftKey==false)){
          d.console.historyIndex = d.console.history.length;
          d.console.eval(el.left.console.input.environment.getElement().value);
          return false;
        }

        switch(_event.keyCode){
          case 40:
            if(d.console.history[d.console.historyIndex+1]){
              d.console.historyIndex+=1;
              el.left.console.input.update( d.console.history[d.console.historyIndex] );
            }
            break;
          case 38:
            if(d.console.history[d.console.historyIndex-1]){
              d.console.historyIndex-=1;
              el.left.console.input.update( d.console.history[d.console.historyIndex] );
            }
            break;
        }
      }
    },
    cssSelectbox:function(){
      with(firebug){
        d.css.open(el.button.css.selectbox.environment.getElement().selectedIndex);
      }
    },
    domTextbox:function(_event){
      with(firebug){
        if(_event.keyCode==13){
          d.dom.open(eval(el.button.dom.textbox.environment.getElement().value),el.left.dom.container);
        }
      }
    },
    inspector:function(){
      with(firebug){
        if (internal.popupWin) {
          internal.popupWin.firebug.d.html.inspect(firebug.d.inspector.el);
        } else {
          firebug.d.html.inspect(firebug.d.inspector.el);
        }
      }
    },
    keyboard:function(_event){
      with(firebug){
        if(_event.keyCode==27 && d.inspector.enabled){
          d.inspector.toggle();
        } else if(_event.keyCode === 123 && (_event.ctrlKey || _event.metaKey)) {
          if(internal.isPopup){
            win.dock();
          }else {
            win.newWindow();
          }
        } else if(
            (_event.keyCode === 123 && (!_event.ctrlKey && !_event.metaKey)) ||
            (_event.keyCode === 76 && (_event.ctrlKey || _event.metaKey) && _event.shiftKey) ||
            (_event.keyCode === 13 && _event.shiftKey)) {

          if(internal.isPopup){
            win.dock();
          } else if (el.main.environment.getStyle("display") === 'none') {
            win.show();
          } else {
            win.hide();
          }
        }
      }
    },
    mouse:function(_event){
      with(firebug){
        var target;
        
        if(document.elementFromPoint) {
          target = document.elementFromPoint(_event.clientX, _event.clientY);
        } else {
          if(lib.env.ie) {
            target = _event.srcElement;
          } else {
            target = _event.explicitOriginalTarget || _event.target;
          }
        }
        
        if( d.inspector.enabled&&
          target!=document.body&&
          target!=document.firstChild&&
          target!=document.childNodes[1]&&
          target!=el.borderInspector.environment.getElement()&&
          target!=el.main.environment.getElement()&&
          target.offsetParent!=el.main.environment.getElement() ) {
            d.inspector.inspect(target);
        }
      }
    },
    runMultiline:function(){
      with(firebug){
        d.console.eval.call(window,el.right.console.input.environment.getElement().value);
      }
    },
    runCSS:function(){
      with(firebug){
        var source = el.right.css.input.environment.getElement().value.replace(/\n|\t/g,"").split("}");
        for(var i=0, len=source.length; i<len; i++){
          var item = source[i]+"}", rule = !lib.env.ie?item:item.split(/{|}/),
              styleSheet = document.styleSheets[0];
          if(item.match(/.+\{.+\}/)){
            if(lib.env.ie)
              styleSheet.addRule(rule[0],rule[1]);
            else
              styleSheet.insertRule( rule, styleSheet.cssRules.length );
          }
        }
      }
    },
    scriptsSelectbox:function(){
      with(firebug){
        d.scripts.open(parseInt(el.button.scripts.selectbox.environment.getElement().value));
      }
    },
    xhrTextbox:function(_event){
      with(firebug){
        if(_event.keyCode==13){
          d.xhr.addObject.apply(internal.targetWindow, el.button.xhr.textbox.environment.getElement().value.split(","));
        }
      }
    }
  }
};

(function(_scope){
  _scope.lib = {};
  var pi  = _scope.lib; pi.version = [1.1,2008091000];

  pi.env = {
    ie: /MSIE/i.test(navigator.userAgent),
    ie6: /MSIE 6/i.test(navigator.userAgent),
    ie7: /MSIE 7/i.test(navigator.userAgent),
    ie8: /MSIE 8/i.test(navigator.userAgent),
    firefox: /Firefox/i.test(navigator.userAgent),
    opera: /Opera/i.test(navigator.userAgent),
    webkit: /Webkit/i.test(navigator.userAgent),
    camino: /Camino/i.test(navigator.userAgent)
  };

  pi.get = function(){
    return document.getElementById(arguments[0]);
  };
  pi.get.byTag = function(){
    return document.getElementsByTagName(arguments[0]);
  };
  pi.get.byClass = function(){ return document.getElementsByClassName.apply(document,arguments); };

  pi.util = {
    Array:{
      clone:function(_array,_undeep){
        var tmp = [];
        Array.prototype.push.apply(tmp,_array);
        pi.util.Array.forEach(tmp,function(_item,_index,_source){
          if(_item instanceof Array&&!_undeep)
            _source[_index] = pi.util.Array.clone(_source[_index]);
        });
        return tmp;
      },
      count:function(_array,_value){
        var count = 0;
        pi.util.Array.forEach(_array,function(){
          count+=Number(arguments[0]==_value);
        });
        return count;
      },
      forEach:function(_array,_function){
        if(_array.forEach)
          return _array.forEach(_function);
        for(var i=0,len=_array.length; i<len; i++)
          _function.apply(_array,[_array[i],i,_array]);   
      },
      getLatest:function(_array){
        return _array[_array.length-1];
      },
      indexOf:function(_array,_value){
        if(!pi.env.ie){
          return _array.indexOf(_value);
        };

        var index = -1;
        for(var i=0, len=_array.length; i<len; i++){
          if(_array[i]==_value){
            index = i;
            break;
          }
        }
        return index;
      },
      remove:function(_array,_index){
        var result = _array.slice(0,_index);
        _array = Array.prototype.push.apply(result,_array.slice(_index+1));
        return result;
      }
    },
    Curry:function(_fn,_scope){
      var fn = _fn, scope = _scope||window, args = Array.prototype.slice.call(arguments,2);
      return function(){ 
        return fn.apply(scope,args.concat( Array.prototype.slice.call(arguments,0) )); 
      };
    },
    Extend:function(_superClass,_prototype,_skipClonning){
      var object = new pi.base;
      if(_prototype["$Init"]){
        object.init = _prototype["$Init"];
        delete _prototype["$Init"];
      };

      object.body = _superClass==pi.base?_prototype:pi.util.Hash.merge(_prototype,_superClass.prototype);
      object.init=object.init||function(){
        if(_superClass!=pi.base)
          _superClass.apply(this,arguments);
      };

      return object.build(_skipClonning);
    },
    IsArray:function(_object){
      if(_object===null){
        return false;
      }
      if(window.NodeList&&window.NamedNodeMap&&!pi.env.ie8){
        if(_object instanceof Array||_object instanceof NodeList||_object instanceof NamedNodeMap||(window.HTMLCollection&&_object instanceof HTMLCollection))
          return true;
      };
      if(!_object||_object==window||typeof _object=="function"||typeof _object=="string"||typeof _object.length!="number"){
        return false
      };
      var len = _object.length;
      if(len>0&&_object[0]!=undefined&&_object[len-1]!=undefined){
        return true;
      } else {
        for(var key in _object){
          if(key!="item"&&key!="length"&&key!="setNamedItemNS"&&key!="setNamedItem"&&key!="getNamedItem"&&key!="removeNamedItem"&&key!="getNamedItemNS"&&key!="removeNamedItemNS"&&key!="tags"){
            return false;
          }
        }
        return true
      };
    },
    IsHash:function(_object){
      return _object && typeof _object=="object"&&(_object==window||_object instanceof Object)&&!_object.nodeName&&!pi.util.IsArray(_object)
    },
    Init:[],
    AddEvent: function(_element,_eventName,_fn,_useCapture){
      _element[pi.env.ie?"attachEvent":"addEventListener"]((pi.env.ie?"on":"")+_eventName,_fn,_useCapture||false);
      return pi.util.Curry(pi.util.AddEvent,this,_element);
    },
    RemoveEvent: function(_element,_eventName,_fn,_useCapture){
      _element[pi.env.ie?"detachEvent":"removeEventListener"]((pi.env.ie?"on":"")+_eventName,_fn,_useCapture||false);
      return pi.util.Curry(pi.util.RemoveEvent,this,_element);
    },
    Element:{
      addClass:function(_element,_class){
        if( !pi.util.Element.hasClass(_element,_class) )
          pi.util.Element.setClass(_element, pi.util.Element.getClass(_element) + " " + _class );
      },
      getClass:function(_element){
        return _element.getAttribute(pi.env.ie&&!pi.env.ie8?"className":"class")||"";
      },
      hasClass:function(_element,_class){
        return pi.util.Array.indexOf(pi.util.Element.getClass(_element).split(" "),_class)>-1;
      },
      removeClass:function(_element,_class){
        if( pi.util.Element.hasClass(_element,_class) ){
          var names = pi.util.Element.getClass(_element,_class).split(" ");
          pi.util.Element.setClass(
              _element, 
              pi.util.Array.remove(names,pi.util.Array.indexOf(names,_class)).join(" ")
          );
        }
      },
      setClass:function(_element,_value){
        if(pi.env.ie8){
          _element.setAttribute("className", _value );
          _element.setAttribute("class", _value );
        } else {
          _element.setAttribute(pi.env.ie?"className":"class", _value );
        }
      },
      toggleClass:function(){
        if(pi.util.Element.hasClass.apply(this,arguments))
          pi.util.Element.removeClass.apply(this,arguments);
        else
          pi.util.Element.addClass.apply(this,arguments);
      },
      getOpacity:function(_styleObject){
        var styleObject = _styleObject;
        if(!pi.env.ie)
          return styleObject["opacity"];

        var alpha = styleObject["filter"].match(/opacity\=(\d+)/i);
        return alpha?alpha[1]/100:1;
      },
      setOpacity:function(_element,_value){
        if(!pi.env.ie)
          return pi.util.Element.addStyle(_element,{ "opacity":_value });
        _value*=100;
        pi.util.Element.addStyle(_element,{ "filter":"alpha(opacity="+_value+")" });
        return this._parent_;
      },
      getPosition:function(_element){
        var parent = _element,offsetLeft = document.body.offsetLeft, offsetTop = document.body.offsetTop, view = pi.util.Element.getView(_element);
        while(parent&&parent!=document.body&&parent!=document.firstChild){
          offsetLeft +=parseInt(parent.offsetLeft);
          offsetTop += parseInt(parent.offsetTop);
          parent = parent.offsetParent;
        };
        return {
          "bottom":view["bottom"],
          "clientLeft":_element.clientLeft,
          "clientTop":_element.clientTop,
          "left":view["left"],
          "marginTop":view["marginTop"],
          "marginLeft":view["marginLeft"],
          "offsetLeft":offsetLeft,
          "offsetTop":offsetTop,
          "position":view["position"],
          "right":view["right"],
          "top":view["top"],
          "zIndex":view["zIndex"]
        };
      },
      getSize:function(_element){
        var view = pi.util.Element.getView(_element);
        return {
          "height":view["height"],
          "clientHeight":_element.clientHeight,
          "clientWidth":_element.clientWidth,
          "offsetHeight":_element.offsetHeight,
          "offsetWidth":_element.offsetWidth,
          "width":view["width"]
        }
      },
      addStyle:function(_element,_style){
        for(var key in _style){
          key = key=="float"?pi.env.ie?"styleFloat":"cssFloat":key;
          if (key == "opacity" && pi.env.ie) {
            pi.util.Element.setOpacity(_element,_style[key]);
            continue;
          }
          try {
            _element.style[key] = _style[key];
          }catch(e){}     
        }
      },
      getStyle:function(_element,_property){
        _property = _property=="float"?pi.env.ie?"styleFloat":"cssFloat":_property;
        if(_property=="opacity"&&pi.env.ie)
          return pi.util.Element.getOpacity(_element.style);
        return typeof _property=="string"?_element.style[_property]:_element.style;
      },
      getValue:function(_element){
        switch(_element.nodeName.toLowerCase()){
          case "input":
          case "textarea":
            return _element.value;
          case "select":
            return _element.options[_element.selectedIndex].value;
          default:
            return _element.innerHTML;
          break;
        }
      },
      getView:function(_element,_property){
        var view = document.defaultView?document.defaultView.getComputedStyle(_element,null):_element.currentStyle;
        _property = _property=="float"?pi.env.ie?"styleFloat":"cssFloat":_property;
        if(_property=="opacity"&&pi.env.ie)
          return pi.util.Element.getOpacity(_element,view);
        return typeof _property=="string"?view[_property]:view;
      }
    },
    Hash: {
      clone:function(_hash,_undeep){
        var tmp = {};
        for(var key in _hash){
          if( !_undeep&&pi.util.IsArray( _hash[key] ) ){
            tmp[key] = pi.util.Array.clone( _hash[key] );
          } else if( !_undeep&&pi.util.IsHash( _hash[key] ) ){
            tmp[ key ] = pi.util.Hash.clone(_hash[key]);
          } else {
            tmp[key] = _hash[key];
          }
        }
        return tmp;
      },
      merge:function(_hash,_source,_undeep){
        for(var key in _source){
          var value = _source[key];
          if (!_undeep&&pi.util.IsArray(_source[key])) {
            if(pi.util.IsArray( _hash[key] )){
              Array.prototype.push.apply( _source[key], _hash[key] )
            }
            else
              value = pi.util.Array.clone(_source[key]);
          }
          else if (!_undeep&&pi.util.IsHash(_source[key])) {
            if (pi.util.IsHash(_hash[key])) {
              value = pi.util.Hash.merge(_hash[key], _source[key]);
            } else {
              value = pi.util.Hash.clone( _source[key] );
            }
          } else if( _hash[key] )
            value = _hash[ key ];
          _hash[key] = value;
        };
        return _hash;
      }
    },
    String:{
      format:function(_str){
        var values = Array.prototype.slice.call(arguments,1);
        return _str.replace(/\{(\d)\}/g,function(){
          return values[arguments[1]];
        })
      }
    },
    GetViewport:function(){
      return {
        height:document.documentElement.clientHeight||document.body.clientHeight,
        width:document.documentElement.clientWidth||document.body.clientWidth
      }
    }
  };

  pi.base = function(){
    this.body = {};
    this.init = null;

    this.build = function(_skipClonning){
      var base = this, skipClonning = _skipClonning||false, _private = {},
      fn = function(){
        var _p = pi.util.Hash.clone(_private);
        if(!skipClonning){
          for(var key in this){
            if(pi.util.IsArray( this[ key ] ) ){
              this[key] = pi.util.Array.clone( this[key] );
            } else
              if( pi.util.IsHash(this[key]) ){
                this[key] = pi.util.Hash.clone( 
                    this[ key ],
                    function(_key,_object){
                      this[ _key ]._parent_ = this;
                    }
                );
                //this[key]._parent_ = this;
              }
          }
        };
        base.createAccessors( _p, this );
        if(base.init)
          return base.init.apply(this,arguments);
        return this;
      };
      this.movePrivateMembers(this.body,_private);
      if(this.init){
        fn["$Init"] = this.init;
      };
      fn.prototype = this.body;
      return fn;
    };

    this.createAccessors = function(_p, _branch){
      var getter = function(_property){ return this[_property]; },
      setter = function(_property,_value){ this[_property] = _value; return _branch._parent_||_branch; };

      for (var name in _p) {
        var isPrivate = name.substring(0, 1) == "_", title = name.substring(1, 2).toUpperCase() + name.substring(2);

        if (isPrivate) {
          _branch[(_branch["get" + title]?"_":"")+"get" + title] = pi.util.Curry(getter,_p,name);
          _branch[(_branch["set" + title]?"_":"")+"set" + title] = pi.util.Curry(setter,_p,name);
        }
        else 
          if (pi.util.IsHash(_p[name])){
            _branch[name]._parent_ = _branch;
            if(!_branch[name])
              _branch[name] = {};
            this.createAccessors(_p[name], _branch[name]);
          }   
      };
    };

    this.movePrivateMembers = function(_object, _branch){
      for (var name in _object) {
        var isPrivate = name.substring(0, 1) == "_";

        if (isPrivate) {
          _branch[name] = _object[name];
          delete _object[name];
        }
        else 
          if (pi.util.IsHash(_object[name])){
            _branch[name] = {};
            this.movePrivateMembers(_object[name], _branch[name]);
          }
      };
    };
  };

  pi.element = new pi.base;
  pi.element.init = function(_val){
    this.environment.setElement(
        typeof _val=="string"||!_val?
            document.createElement(_val||"DIV"):
              _val
    );
    return this;
  };

  pi.element.body = {
    "addStyle":function(){
      return this.environment.addStyle.apply(this.environment,arguments);
    },
    "clean":function(){
      var childs = this.child.get();
      while(childs.length){
        childs[0].parentNode.removeChild(childs[0]);
      }
    },
    "clone":function(_deep){
      return this.environment.getElement().cloneNode(_deep);
    },
    "insert":function(_element){
      _element = _element.environment?_element.environment.getElement():_element;
      _element.appendChild(this.environment.getElement());
      return this;
    },
    "insertAfter":function(_referenceElement){
      _referenceElement = _referenceElement.environment?_referenceElement.environment.getElement():_referenceElement;
      _referenceElement.nextSibling?this.insertBefore(_referenceElement.nextSibling):this.insert(_referenceElement.parentNode);
      return this;
    },
    "insertBefore":function(_referenceElement){
      _referenceElement = _referenceElement.environment?_referenceElement.environment.getElement():_referenceElement;
      _referenceElement.parentNode.insertBefore(this.environment.getElement(),_referenceElement);
      return this;
    },
    "query":function(_expression,_resultType,namespaceResolver,_result){
      return pi.xpath(_expression,_resultType||"ORDERED_NODE_SNAPSHOT_TYPE",this.environment.getElement(),_namespaceResolver,_result);
    },
    "remove":function(){
      if (this.environment.getParent()) {
        this.environment.getParent().removeChild(this.environment.getElement());
      }
    },
    "update":function(_value){
      this.element[this.element.nodeName.toLowerCase()=="textarea"||this.element.nodeName.toLowerCase()=="input"?"value":"innerHTML"]=_value;
      return this;
    },
    "attribute":{
      "getAll":function(){
        return this._parent_.environment.getElement().attributes;
      },
      "clear":function(_name){
        this.set(_name,"");
        return this._parent_;
      },
      "get":function(_name){
        return this._parent_.environment.getElement().getAttribute(_name);
      },
      "has":function(_name){
        return pi.env.ie?(this.get(_name)!=null):this._parent_.environment.getElement().hasAttribute(_name);
      },
      "remove":function(_name){
        this._parent_.environment.getElement().removeAttribute(_name);
        return this._parent_;
      },
      "set":function(_name,_value){
        this._parent_.environment.getElement().setAttribute(_name,_value);
        return this._parent_;
      },
      "addClass":function(_classes){
        for(var i=0,len=arguments.length; i<len; i++){
          pi.util.Element.addClass(this._parent_.environment.getElement(),arguments[i]);
        };
        return this._parent_;
      },
      "clearClass":function(){
        this.setClass("");
        this._parent_;
      },
      "getClass":function(){
        return pi.util.Element.getClass( this._parent_.environment.getElement() );
      },
      "hasClass":function(_class){
        return pi.util.Element.hasClass( this._parent_.environment.getElement(), _class );
      },
      "setClass":function(_value){
        return pi.util.Element.setClass( this._parent_.environment.getElement(), _value );
      },
      "removeClass":function(_class){
        pi.util.Element.removeClass( this._parent_.environment.getElement(), _class );
        return this._parent_;
      },
      "toggleClass":function(_class){
        pi.util.Element.toggleClass( this._parent_.environment.getElement(), _class );
      }
    },
    "child":{
      "get":function(){
        return this._parent_.environment.getElement().childNodes;
      },
      "add":function(_elements){
        for (var i = 0; i < arguments.length; i++) {
          var el = arguments[i];
          this._parent_.environment.getElement().appendChild(
              el.environment ? el.environment.getElement() : el
          );
        }
        return this._parent_;
      },
      "addAfter":function(_element,_referenceElement){
        this.addBefore(
            _element.environment?_element.environment.getElement():_element,
                (_referenceElement.environment?_referenceElement.environment.getElement():_referenceElement).nextSibling
        );
        return this._parent_;
      },
      "addBefore":function(_element,_referenceElement){
        this._parent_.environment.getElement().insertBefore(
            _element.environment?_element.environment.getElement():_element,
                _referenceElement.environment?_referenceElement.environment.getElement():_referenceElement
        );
        return this._parent_;
      },
      "remove":function(_element){
        this._parent_.environment.getElement().removeChild(_element.environment?_element.environment.getElement():_element);
      }
    },
    "environment":{
      "_element":null,
      "setElement":function(_value){
        this._parent_.element = _value;
        this._parent_.element.lib = this._parent_;
        this._parent_.element.firebugElement = true;
        this._setElement(_value);
      },
      "getParent":function(){
        return this.getElement().parentNode;
      },
      "getPosition":function(){
        return pi.util.Element.getPosition(this.getElement());
      },
      "getSize":function(){
        return pi.util.Element.getSize( this.getElement() );
      },
      "addStyle":function(_styleObject){
        pi.util.Element.addStyle(this.getElement(),_styleObject);
        return this._parent_;
      },
      "getStyle":function(_property){
        return pi.util.Element.getStyle(this.getElement(),_property);
      },
      "getName":function(){
        return this.getElement().nodeName;
      },
      "getType":function(){
        return this.getElement().nodeType;
      },
      "getValue":function(){
        return pi.util.Element.getValue(this.getElement());
      },
      "getView":function(_property){
        return pi.util.Element.getView(this.getElement(),_property);
      }
    },
    "event":{
      "addListener":function(_event,_fn,_useCapture){
        pi.util.AddEvent(this._parent_.environment.getElement(),_event,_fn,_useCapture);
        return this._parent_;
      },
      "removeListener":function(_event,_fn,_useCapture){
        pi.util.RemoveEvent(this._parent_.environment.getElement(),_event,_fn,_useCapture);
        return this._parent_;
      }
    }
  };
  pi.element = pi.element.build();

  pi.xhr = new pi.base;
  pi.xhr.init = function(_url){
    if(!window.XMLHttpRequest){
      var names = ["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];
      for (var i = 0; i < names.length; i++) {
        try {
          this.environment.setApi(new ActiveXObject(names[i]));
          break;
        } catch (e) { continue; }
      }
    }
    else {
      this.environment.setApi(new XMLHttpRequest());
    }
    this.environment.getApi().onreadystatechange=pi.util.Curry(this.event.readystatechange,this);
    this.environment.setUrl(_url);
    this.environment.setCallback([]);

    return this;
  };
  pi.xhr.body = {
    "addCallback": function(){
      return this.environment.addCallback.apply(this.environment,arguments);
    },
    "addData": function(){
      return this.environment.addData.apply(this.environment,arguments);
    },
    "abort":function(){
      this.environment.getApi().abort();
      return this;
    },
    "send":function(){
      var url = this.environment.getUrl(), data = this.environment.getData(),dataUrl = ""; 

      if(!this.environment.getCache())
        data["forceCache"] = Number(new Date);

      for (var key in data)
        dataUrl += pi.util.String.format("{0}={1}&",key, data[key]);

      if (this.environment.getType()=="GET")
        url += (url.search("\\?")==-1?"?":"&")+pi.util.String.format("{0}",dataUrl);

      this.api.open(this.environment.getType(),url,this.environment.getAsync());
      if(this.environment.getType()=="POST"){
        this.api.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
      };
      this.api.send(this.environment.getType()=="GET"?"":dataUrl);
      return this;
    }
  };
  pi.xhr.body.environment = {
    "_async":true, "_api":null, "_cache":true, "_callback":null, "_data":{}, "_type":"GET", "_url":"",
    "setApi":function(_value){
      this._parent_.api = _value;
      this._setApi(_value);
    },
    "addCallback": function(_readyState,_fn){
      this.getCallback().push({ "fn":_fn, "readyState":_readyState  });
      return this._parent_;
    },
    "addData": function(_key,_value){
      this.getData()[_key] = _value;
      return this._parent_;
    },
    "setType": function(_value){
      this._setType(_value);
      return this._parent_;
    }
  };
  pi.xhr.body.event = {
    "readystatechange":function(){
      var readyState = this.environment.getApi().readyState, callback=this.environment.getCallback();
      for (var i = 0, len=callback.length; i < len; i++) {
        if(pi.util.Array.indexOf(callback[i].readyState,readyState)>-1){
          callback[i].fn.apply(this);
        }
      }
    }
  };
  pi.xhr = pi.xhr.build();

  /*
   * xml.xhr.get
   */

  pi.xhr.get = function(_url,_returnPiObject){
    var request = new pi.xhr();
    request.environment.setAsync(false);
    request.environment.setUrl(_url);
    request.send();
    return _returnPiObject?request:request.environment.getApi();
  };

  /*
   * registering onload event for init functions
   */
  pi.util.AddEvent(
    pi.env.ie?window:document,
    pi.env.ie?"load":"DOMContentLoaded",
    function(){
      for(var i=0,len=pi.util.Init.length; i<len; i++){
        pi.util.Init[ i ]();
      }
    }
  );
})(firebug);

(function(){
  with(firebug){
    var scriptsIncluded = document.getElementsByTagName('script');
    for(var i=scriptsIncluded.length-1; i>=0; i--){
      var script = scriptsIncluded[i],
          src = getFileName(script.src);
      if(src){
        internal.liteFilename = src;
        break;
      }
    }
    initConsole();
    lib.util.Init.push(firebug.init);
  }
})();
