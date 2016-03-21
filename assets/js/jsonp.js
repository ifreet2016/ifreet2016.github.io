/**
 * Handle JSONP requests
 * after getting data, removing script and API callback function.
 * @param {string} url - API url
 * @callback callback with updated data.
 */
var JSONP = {
  get: function(url, callback) {
    var head = document.getElementsByTagName('head')[0],
        script = document.createElement('script'),
        callbackName = url.slice(url.indexOf('&callback=')+10, url.length);

    window[callbackName] = function(data) {
      callback.bind(window)(data);
      head.removeChild(script);
      script = null;
      delete window[callbackName];
    }

    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);

  }
};
