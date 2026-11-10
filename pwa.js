/*
  WEAR ME: makes the store and the dashboard installable apps.
  - registers the service worker (sw.js) so the app opens fast and shows its shell without internet
  - gives the "Install" buttons something to call: wmInstall()
*/
(function () {
  "use strict";
  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener("appinstalled", function () { deferred = null; });

  window.wmIsStandalone = function () {
    try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (e) { return false; }
  };
  // Resolves "prompted" (the browser showed its install box), "ios" (needs Share > Add to Home Screen) or "manual".
  window.wmInstall = function () {
    if (deferred) {
      var d = deferred; deferred = null;
      d.prompt();
      return (d.userChoice || Promise.resolve()).then(function () { return "prompted"; }, function () { return "prompted"; });
    }
    var ua = navigator.userAgent || "";
    var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return Promise.resolve(ios ? "ios" : "manual");
  };

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* the site still works without it */ });
    });
  }
})();
