
function initThemeChooser(settings) {
  var isInitialized = false;
  var currentThemeSystem; // don't set this directly. use setThemeSystem
  var currentStylesheetEl;
  var loadingEl = document.getElementById('loading');
  var systemSelectEl = document.querySelector('#theme-system-selector select');
  var themeSelectWrapEls = Array.prototype.slice.call( // convert to real array
    document.querySelectorAll('.selector[data-theme-system]')
  );

  systemSelectEl.addEventListener('change', function() {
    setThemeSystem(this.value);
  });

  setThemeSystem(systemSelectEl.value);

  themeSelectWrapEls.forEach(function(themeSelectWrapEl) {
    var themeSelectEl = themeSelectWrapEl.querySelector('select');

    themeSelectWrapEl.addEventListener('change', function() {
      setTheme(
        currentThemeSystem,
        themeSelectEl.options[themeSelectEl.selectedIndex].value
      );
    });
  });


  function setThemeSystem(themeSystem) {
    var selectedTheme;

    currentThemeSystem = themeSystem;

    themeSelectWrapEls.forEach(function(themeSelectWrapEl) {
      var themeSelectEl = themeSelectWrapEl.querySelector('select');

      if (themeSelectWrapEl.getAttribute('data-theme-system') === themeSystem) {
        selectedTheme = themeSelectEl.options[themeSelectEl.selectedIndex].value;
        themeSelectWrapEl.style.display = 'inline-block';
      } else {
        themeSelectWrapEl.style.display = 'none';
      }
    });

    setTheme(themeSystem, selectedTheme);
  }


  function setTheme(themeSystem, themeName) {
    var stylesheetUrl = generateStylesheetUrl(themeSystem, themeName);
    var stylesheetEl;

    function done() {
      if (!isInitialized) {
        isInitialized = true;
        settings.init(themeSystem);
      }
      else {
        settings.change(themeSystem);
      }

      showCredits(themeSystem, themeName);
    }

    if (stylesheetUrl) {
      stylesheetEl = document.createElement('link');
      stylesheetEl.setAttribute('rel', 'stylesheet');
      stylesheetEl.setAttribute('href', stylesheetUrl);
      document.querySelector('head').appendChild(stylesheetEl);

      loadingEl.style.display = 'inline';

      whenStylesheetLoaded(stylesheetEl, function() {
        if (currentStylesheetEl) {
          currentStylesheetEl.parentNode.removeChild(currentStylesheetEl);
        }
        currentStylesheetEl = stylesheetEl;
        loadingEl.style.display = 'none';
        done();
      });
    } else {
      if (currentStylesheetEl) {
        currentStylesheetEl.parentNode.removeChild(currentStylesheetEl);
        currentStylesheetEl = null
      }
      done();
    }
  }


  function generateStylesheetUrl(themeSystem, themeName) {
    if (themeSystem === 'jquery-ui') {
      return 'https://code.jquery.com/ui/1.12.1/themes/' + themeName + '/jquery-ui.css';
    }
    else if (themeSystem === 'bootstrap3') {
      if (themeName) {
        return 'https://bootswatch.com/3/' + themeName + '/bootstrap.min.css';
      }
      else { // the default bootstrap theme
        return 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css';
      }
    }
    else if (themeSystem === 'bootstrap4') {
      if (themeName) {
        return 'https://bootswatch.com/4/' + themeName + '/bootstrap.min.css';
      }
      else { // the default bootstrap4 theme
        return 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css';
      }
    }
  }


  function showCredits(themeSystem, themeName) {
    var creditId;

    if (themeSystem === 'jquery-ui') {
      creditId = 'jquery-ui';
    }
    else if (themeSystem.match('bootstrap')) {
      if (themeName) {
        creditId = 'bootstrap-custom';
      }
      else {
        creditId = 'bootstrap-standard';
      }
    }

    Array.prototype.slice.call( // convert to real array
      document.querySelectorAll('.credits')
    ).forEach(function(creditEl) {
      if (creditEl.getAttribute('data-credit-id') === creditId) {
        creditEl.style.display = 'block';
      } else {
        creditEl.style.display = 'none';
      }
    })
  }


  function whenStylesheetLoaded(linkNode, callback) {
    var isReady = false;

    function ready() {
      if (!isReady) { // avoid double-call
        isReady = true;
        callback();
      }
    }

    linkNode.onload = ready; // does not work cross-browser
    setTimeout(ready, 2000); // max wait. also handles browsers that don't support onload
  }
}
