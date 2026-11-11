/*
  WEAR ME service worker.
  - Pages and code: network first (so a new deploy shows up straight away), saved copy when offline.
  - The server (products, orders, logins, uploads) is never saved here, so nothing private is kept on the device.
  Change VERSION when you want every phone to throw away its saved copies.
*/
var VERSION = "wm-pwa-3";
var SHELL = [
  "./", "index.html", "admin.html", "styles.css", "app.js", "api-client.js", "config.js", "pwa.js",
  "manifest.webmanifest", "admin.webmanifest",
  "wm-icon-192.png", "wm-icon-512.png", "wm-icon-maskable-512.png", "wm-apple-touch-icon.png",
  "wm-admin-192.png", "wm-admin-512.png", "wm-admin-maskable-512.png", "wm-admin-apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () { /* one missing file must not stop the install */ }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function networkFirst(req) {
  return new Promise(function (resolve) {
    var done = false;
    var fallback = function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === "navigate") {
          var admin = /admin(\.html)?$/.test(new URL(req.url).pathname);
          return caches.match(admin ? "admin.html" : "index.html");
        }
        return undefined;
      });
    };
    var timer = setTimeout(function () {
      fallback().then(function (hit) { if (hit && !done) { done = true; resolve(hit); } });
    }, 4000);
    fetch(req).then(function (res) {
      clearTimeout(timer);
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
      }
      if (!done) { done = true; resolve(res); }
    }).catch(function () {
      clearTimeout(timer);
      fallback().then(function (hit) {
        if (!done) { done = true; resolve(hit || Response.error()); }
      });
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // the server and Google are left alone
  e.respondWith(networkFirst(req));
});
