Super Theme Switcher is a jQuery plugin based on the original jQuery theme switcher that is no longer hosted or supported by the jQuery UI project.

### Example:
    $('#switcher').themeswitcher({
        imgpath: "images/",
    	loadTheme: "dot-luv"
    });

But since all parameters are optional you can just use it like this:
    $('#switcher').themeswitcher();
    
### Options
 
 * **imgPath**: String, path to image directory where theme icons are located
 * **rounded**: Boolean, rounded corners on themeswitcher link and dropdown
 * **themes**: An array of theme objects that will override the default themes.  
 [{title:"My theme",name:"my-theme",icon:"my-icon.png",url:"http://url-to-my-css-file.css"}]
 * **additionalThemes**: An array of theme objects that will be INCLUDED along with the default themes.  
 [{title:"My theme",name:"my-theme",icon:"my-icon.png",url:"http://url-to-my-css-file.css"}]
 * **jqueryUiVersion**: String, jQuery UI version of themes (Default themes are linked from Google CDN)
 * **themePath**: String, Base path to where the jQuery UI CSS themes are located (Default is Google CDN)

Demo located [here](http://dl.dropbox.com/u/188460/themeswitcher/sample.htm).

This plugin includes the awesome jQuery cookie plugin by Klaus Hartl found [here](https://github.com/carhartl/jquery-cookie)

Contact
----
[@davehoff](http://www.twitter.com/davehoff)