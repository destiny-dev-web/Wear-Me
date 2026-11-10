/*
  WEAR ME: connection to the server.
  This file gives the website its storage: a database (products, orders and so on),
  file uploads, the admin login, and file downloads. The pages talk to the server
  you set up in 2-server-files, through the address in config.js.
*/
(function () {
  "use strict";
  var cfg = window.WM_CONFIG || {};
  var API = String(cfg.apiBase || "").replace(/\/+$/, "");
  var IS_ADMIN = window.WM_MODE === "admin";
  // The dashboard keeps its login for this tab only. The store keeps the customer's login on this device.
  var TOKEN_KEY = IS_ADMIN ? "wm_admin_token" : "wm_customer_token";
  var storage = function () { return IS_ADMIN ? sessionStorage : localStorage; };
  window.WM_BLOB = API + "/blob/";

  function token() { try { return storage().getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
  function setToken(t) { try { if (t) storage().setItem(TOKEN_KEY, t); else storage().removeItem(TOKEN_KEY); } catch (e) { /* ignore */ } }

  function request(method, path, body, headers) {
    var h = Object.assign({}, headers || {});
    var t = token();
    if (t) h.Authorization = "Bearer " + t;
    var opts = { method: method, headers: h };
    if (body !== undefined) {
      if (typeof Blob !== "undefined" && body instanceof Blob) opts.body = body;
      else { h["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    }
    return fetch(API + path, opts).then(function (res) {
      return res.text().then(function (txt) {
        var data = null;
        try { data = txt ? JSON.parse(txt) : null; } catch (e) { /* not json */ }
        if (!res.ok) {
          var err = new Error((data && data.error) || "Request failed (" + res.status + ")");
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  /* ---------- database ---------- */
  var subs = [], timer = null;
  function schedule() {
    clearInterval(timer);
    var ms = Math.max(2, Number(cfg.pollSeconds) || 5) * 1000;
    timer = setInterval(function () { if (!document.hidden) pollAll(); }, ms);
  }
  function pollOne(s) {
    return s.load().then(function (txt) {
      var key = JSON.stringify(txt);
      if (key === s.last) return;
      s.last = key;
      s.cb(s.snap(txt));
    }).catch(function (e) { if (s.err) s.err(e); });
  }
  function pollAll() { subs.slice().forEach(pollOne); }
  function subscribe(load, snap, cb, err) {
    var s = { load: load, snap: snap, cb: cb, err: err, last: null };
    subs.push(s);
    pollOne(s);
    if (!timer) schedule();
    return function () { var i = subs.indexOf(s); if (i > -1) subs.splice(i, 1); };
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) pollAll(); });

  function docSnap(path, r) {
    var data = r && r.exists ? r.data : undefined;
    return { id: path.split("/").pop(), exists: data !== undefined, data: function () { return data; } };
  }
  function colSnap(r) {
    var list = ((r && r.docs) || []).map(function (d) { return { id: d.id, data: function () { return d.data; } }; });
    return { docs: list, size: list.length, empty: !list.length };
  }
  function afterWrite(p) { return p.then(function (v) { setTimeout(pollAll, 50); return v; }); }
  var enc = encodeURIComponent;
  var db = {
    doc: function (path) {
      var q = "?path=" + enc(path);
      return {
        get: function () { return request("GET", "/api/doc" + q).then(function (r) { return docSnap(path, r); }); },
        set: function (v) { return afterWrite(request("PUT", "/api/doc" + q, v)); },
        update: function (v) { return afterWrite(request("PATCH", "/api/doc" + q, v)); },
        delete: function () { return afterWrite(request("DELETE", "/api/doc" + q)); },
        onSnapshot: function (cb, err) {
          return subscribe(function () { return request("GET", "/api/doc" + q); }, function (r) { return docSnap(path, r); }, cb, err);
        }
      };
    },
    collection: function (name) {
      function make(where) {
        var q = "?name=" + enc(name) + (where ? "&where=" + enc(where) : "");
        return {
          where: function (field, op, value) { return make(field + "," + op + "," + value); },
          get: function () { return request("GET", "/api/col" + q).then(colSnap); },
          onSnapshot: function (cb, err) {
            return subscribe(function () { return request("GET", "/api/col" + q); }, colSnap, cb, err);
          }
        };
      }
      return make("");
    }
  };

  /* ---------- uploads ---------- */
  var assets = {
    upload: function (file) {
      return request("POST", "/api/upload", file, { "Content-Type": file.type || "application/octet-stream", "X-File-Name": enc(file.name || "file") })
        .then(function (r) { return { id: r.id, url: API + r.url, contentType: r.contentType }; });
    }
  };

  /* ---------- downloads ---------- */
  var downloads = {
    save: function (o) {
      return new Promise(function (resolve) {
        var blob = o.data instanceof Blob ? o.data : new Blob([o.data]);
        var url = URL.createObjectURL(blob), a = document.createElement("a");
        a.href = url; a.download = o.filename || "download";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        resolve();
      });
    }
  };

  /* ---------- admin login ---------- */
  window.wmAdmin = {
    status: function () { return request("GET", "/api/admin/status"); },
    create: function (email, password) {
      return request("POST", "/api/admin/create", { email: email, password: password }).then(function (r) { setToken(r.token); return r; });
    },
    login: function (email, password) {
      return request("POST", "/api/admin/login", { email: email, password: password }).then(function (r) { setToken(r.token); return r; });
    },
    logout: function () {
      var p = request("POST", "/api/admin/logout").catch(function () { /* ignore */ });
      setToken(""); return p;
    },
    saveProfile: function (p) { return request("PUT", "/api/admin/profile", p); },
    changePassword: function (oldPw, newPw) { return request("POST", "/api/admin/password", { old: oldPw, password: newPw }); }
  };

  /* ---------- customer login (store) ---------- */
  window.wmCustomer = {
    hasToken: function () { return !IS_ADMIN && !!token(); },
    signup: function (d) { return request("POST", "/api/customer/signup", d).then(function (r) { setToken(r.token); return r; }); },
    login: function (email, password) {
      return request("POST", "/api/customer/login", { email: email, password: password }).then(function (r) { setToken(r.token); return r; });
    },
    me: function () { return request("GET", "/api/customer/me"); },
    config: function () { return request("GET", "/api/config"); },
    google: function (credential) { return request("POST", "/api/customer/google", { credential: credential }).then(function (r) { setToken(r.token); return r; }); },
    logout: function () {
      var p = request("POST", "/api/customer/logout").catch(function () { /* ignore */ });
      setToken(""); return p;
    },
    clear: function () { setToken(""); }
  };

  /* The app asks for its tools by name. */
  var user = {
    canEdit: function () { return Promise.resolve(IS_ADMIN && !!token()); },
    id: function () { return Promise.resolve(null); }
  };
  window.claude = {
    use: function (name) {
      if (name === "db") return Promise.resolve(db);
      if (name === "assets") return Promise.resolve(assets);
      if (name === "downloads") return Promise.resolve(downloads);
      if (name === "user") return Promise.resolve(user);
      return Promise.resolve(null);
    }
  };
})();
