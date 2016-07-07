var configValidation = require('./lib/configValidation');
var angularServerRenderer = require('./lib/AngularServerRenderer');

var AngularServer = function() {

  var configLoaded = false;
  this.renderer = null;

  this.init = function(config) {

    if (configLoaded === false) {

      if (configValidation(config)) {
        configLoaded = true;
        this.renderer = angularServerRenderer(config);
      } else {
        throw new Error('The config object is invalid');
      }
    }
  };

  /**
   *
   * @param html
   * @param url
   * @returns {Q}
     */
  this.render = function(html, url) {
    if (!configLoaded) {
      throw new Error('The config object is not loaded');
    }
    return this.renderer.render(html, url);
  };
};


exports = AngularServer;