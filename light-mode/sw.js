"use strict";

var CACHE_NAME = "light-mode-v1";
var APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // cache.add() per file (not cache.addAll) so one failed fetch on a
      // flaky connection doesn't abort caching of the rest of the shell.
      return Promise.all(
        APP_SHELL.map(function (url) {
          return cache.add(url).catch(function (err) {
            console.log("Failed to precache " + url, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_NAME;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;

  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(function (cached) {
      // Stale-while-revalidate: always refetch in the background and update
      // the cache, so a cached response is never served forever — the next
      // load picks up whatever changed, instead of being stuck on old code.
      var refresh = fetch(request)
        .then(function (response) {
          if (response && response.ok) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(function () {
          return null;
        });

      if (cached) return cached;

      return refresh.then(function (response) {
        if (response) return response;
        if (request.mode === "navigate") return caches.match("./index.html");
        return Promise.reject("network unavailable and no cache match");
      });
    })
  );
});
