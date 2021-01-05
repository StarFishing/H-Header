function onMsgRecv(e, r, a) {
  if (chrome.runtime.id == r.id) {
    var t;
    switch (e.method) {
      case 'pull':
        if ('config' == e.source)
          a({
            result: !0,
            headers: headers,
            config: config
          });
        else if ('popup' == e.source) {
          var s = {};
          for (var t in headers_value) {
            var n = headers[findItemIndexBy(headers, 'name', t, !0)];
            s[n.name] = {
              value: headers_value[t],
              preset: n.preset
            };
          }
          a({
            result: !0,
            data: s
          });
        }
        break;
      case 'push':
        try {
          (headers = e.data),
            compileHeaders(),
            storageEngine.set({
              headers: headers
            }),
            a({
              result: !0
            });
        } catch (i) {
          a({
            result: !1
          });
        }
        break;
      case 'updatecfg':
        (config = e.config),
          (localStorage.config = JSON.stringify(config)),
          storageEngine.set({
            headers: headers
          }),
          config.keepvalue ||
            storageEngine.set({
              headers_value: {}
            }),
          a({
            result: !0
          });
        break;
      case 'change':
        (headers_value[e.which.toLowerCase()] = e.value),
          config.keepvalue &&
            storageEngine.set({
              headers_value: headers_value
            }),
          a({
            result: !0,
            which: e.which
          });
        break;
      case 'factoryreset':
        localStorage.clear(), storageEngine.clear(), chrome.runtime.reload();
        break;
      default:
        a({
          result: !1
        });
    }
  }
}
function findItemIndexBy(e, r, a, t) {
  var s = -1;
  return (
    (t = !!t),
    t && (a = a.toLowerCase()),
    e.every(function (e, n) {
      return (t && e[r].toLowerCase() == a) || e[r] == a ? ((s = n), !1) : !0;
    }),
    s
  );
}
function compileHeaders() {
  (headers_compiled = {}), (headers_origName = {});
  var e = {};
  headers.forEach(function (r, a) {
    var t = r.name.toLowerCase();
    if (headers_compiled.hasOwnProperty(t)) return !0;
    for (var s = [], n = 0; n < r.auto.length; n++) {
      var i = r.auto[n];
      s.push({
        name: i.name,
        desc: i.desc,
        value: i.value,
        test: compileAR(i)
      });
    }
    return (
      (headers_compiled[t] = s),
      (headers_origName[t] = r.name),
      (e[t] = headers_value[t] || '@AUTO'),
      !0
    );
  }),
    (headers_value = e);
}
function compileAR(e) {
  var r;
  if (0 == e.condition.length)
    r = function (e) {
      return !1;
    };
  else {
    for (var a = [], t = 0; t < e.condition.length; t++) {
      var s = e.condition[t],
        n = s.where,
        i = s.value,
        o = s.method,
        c = s.inv;
      a.push(compileCondition(n, i, o, c));
    }
    r = function (e) {
      var r,
        t = [];
      for (r = 0; r !== a.length; r++) {
        var s = a[r],
          n = s(e);
        if (!n) return null;
        t.push(n);
      }
      return t;
    };
  }
  return r;
}
function compileCondition(e, r, a, t) {
  var s;
  switch (e) {
    case 'url':
    case 'method':
    case 'type':
      s = function (r) {
        return r[e];
      };
      break;
    case 'referer':
      s = function (e) {
        var r = findItemIndexBy(e.requestHeaders, 'name', 'Referer', !0);
        return -1 === r ? '' : e.requestHeaders[r].value;
      };
  }
  var n, i;
  switch (a) {
    case 'include':
      n = function (e) {
        return s(e).indexOf(r) >= 0;
      };
      break;
    case 'include_ci':
      n = function (e) {
        return s(e).toLowerCase().indexOf(r.toLowerCase()) >= 0;
      };
      break;
    case 'equal':
      n = function (e) {
        return s(e) == r;
      };
      break;
    case 'equal_ci':
      n = function (e) {
        return s(e).toLowerCase() == r.toLowerCase();
      };
      break;
    case 'regex_ci':
      (i = new RegExp(r, 'i')),
        (n = function (e) {
          return i.exec(s(e)) || !1;
        });
      break;
    case 'regex':
      (i = new RegExp(r)),
        (n = function (e) {
          return i.exec(s(e)) || !1;
        });
  }
  return t
    ? function (e) {
        return !n(e);
      }
    : n;
}
function storageRecv(e) {
  if (
    ('undefined' != typeof e.headers
      ? (headers = e.headers)
      : storageEngine.set({
          headers: headers
        }),
    compileHeaders(),
    'undefined' != typeof e.headers_value && config.keepvalue)
  ) {
    var r = e.headers_value;
    for (var a in r) '@AUTO' == headers_value[a] && (headers_value[a] = r[a]);
  }
}
function executeAUTO(e, r) {
  var a = '@DEFAULT';
  return (
    headers_compiled[e].every(function (e) {
      var t = e.test(r);
      if (t) {
        var s = new MagicVariableProcess(r, t);
        return (a = s.process(e.value)), !1;
      }
      return !0;
    }),
    a
  );
}
function MagicVariableProcess(e, r) {
  (this.details = e),
    (this.pattern = /{([^}]+)}/g),
    (this.p2 = {
      rand: /^rand:(\d+)\D+(\d+)$/,
      date: /^date:(.+)$/,
      result: /^result:(\d+)\D+(\d+)$/
    }),
    (this.urldetails = uriDecoder.exec(e.url)),
    (this.result = r);
}
function myMod(e) {
  for (var r = e.requestHeaders, a = {}, t = r.length - 1; -1 !== t; t--) {
    var s = r[t].name,
      n = s.toLowerCase();
    a[n] = r[t];
  }
  var i = new MagicVariableProcess(e, null);
  for (var s in headers_value) {
    var o = headers_value[s],
      c = a[s],
      u = !1;
    if (
      (c ||
        ((c = {
          name: headers_origName[s],
          value: void 0
        }),
        r.push(c)),
      '@AUTO' === o && ((u = !0), (o = executeAUTO(s, e))),
      '@BLANK' === o)
    )
      o = '';
    else if ('@DEFAULT' === o) o = c.value;
    else if ('@DELETE' === o) o = void 0;
    else {
      if ('@BLOCK' === o)
        return {
          cancel: !0
        };
      u || (o = i.process(o));
    }
    c.value = o;
  }
  for (var t = r.length - 1; -1 !== t; t--)
    'undefined' == typeof r[t].value && r.splice(t, 1);
  return {
    requestHeaders: r
  };
}
Date.prototype.format = function (e) {
  var r = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  };
  /(y+)/.test(e) &&
    (e = e.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    ));
  for (var a in r)
    new RegExp('(' + a + ')').test(e) &&
      (e = e.replace(
        RegExp.$1,
        1 == RegExp.$1.length ? r[a] : ('00' + r[a]).substr(('' + r[a]).length)
      ));
  return e;
};
var config = {
  sync: !0,
  keepvalue: !1
};
try {
  config = JSON.parse(localStorage.config);
} catch (e) {
  localStorage.config = JSON.stringify(config);
}
var storageEngine = {
    syncbuff: {},
    synctimeout: {},
    synclast: 0,
    sync: function () {
      this.synctimeout && clearTimeout(this.synctimeout),
        '{}' != JSON.stringify(this.syncbuff) &&
          chrome.storage.sync.set(this.syncbuff),
        (this.syncbuff = {}),
        (this.synctimeout = 0);
    },
    get: function (e) {
      chrome.storage.local.get(e);
    },
    set: function (e) {
      if ((chrome.storage.local.set(e), config.sync)) {
        for (var r in e) this.syncbuff[r] = e[r];
        this.synctimeout ||
          (this.sync(), (this.synctimeout = setTimeout(this.sync, 6e4)));
      }
    },
    clear: function () {
      chrome.storage.local.clear(), chrome.storage.sync.clear();
    }
  },
  headers = [
    {
      name: 'User-Agent',
      preset: [
        {
          name: 'Samsung Galaxy S4',
          value:
            'Mozilla/5.0 (Linux; Android 4.2.2; GT-I9505 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36'
        },
        {
          name: 'iPhone 6',
          value:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
        },
        {
          name: 'IE6',
          value:
            'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; FSL 7.0.6.01001)'
        },
        {
          name: 'Googlebot 2.1',
          value:
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        },
        {
          name: 'Baidu Spider(PC)',
          value:
            'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'
        }
      ],
      auto: [
        {
          name: chrome.i18n.getMessage('ar_test_title'),
          desc: 'Just a test',
          value:
            'Mozilla/5.0 (compatible; SmartHeader/' +
            chrome.runtime.getManifest().version +
            ')',
          condition: [
            {
              inv: !1,
              method: 'include_ci',
              value: 'laobubu.net',
              where: 'url'
            },
            {
              inv: !1,
              method: 'include_ci',
              value: 'smartheader',
              where: 'url'
            }
          ]
        }
      ]
    },
    {
      name: 'Accept-Language',
      preset: [
        {
          name: 'English(US)',
          value: 'en-US,en;q=0.5'
        },
        {
          name: 'Chinese(Simplified)',
          value: 'zh-CN,zh;q=0.8'
        }
      ],
      auto: []
    }
  ],
  headers_compiled = {},
  headers_value = {},
  headers_origName = {};
chrome.runtime.onMessage.addListener(onMsgRecv),
  chrome.storage.local.get(function (e) {
    var r = !1;
    if (
      ('undefined' != typeof e.headers
        ? ((headers = e.headers), compileHeaders())
        : (r = !0),
      'undefined' != typeof e.headers_value && config.keepvalue)
    ) {
      var a = e.headers_value;
      for (var t in a) '@AUTO' == headers_value[t] && (headers_value[t] = a[t]);
    }
    r && config.sync && chrome.storage.sync.get(storageRecv);
  });
const uriDecoder = /^(\w+)\:\/\/([^\/\:]+)(\:(\d+))?(([^\?]+)(\?.*)?)$/;
(MagicVariableProcess.prototype.handleMatch = function (e, r) {
  var a;
  return 'url' === r
    ? this.urldetails[0]
    : 'scheme' === r
    ? this.urldetails[1]
    : 'host' === r
    ? this.urldetails[2]
    : 'port' === r
    ? this.urldetails[4] || ('https' === this.urldetails[1] ? 443 : 80)
    : 'uri' === r
    ? this.urldetails[5]
    : 'path' === r
    ? this.urldetails[6]
    : 'query' === r
    ? this.urldetails[7] || ''
    : (a = this.p2.rand.exec(r))
    ? ~~a[1] + Math.round(Math.random() * (a[2] - a[1]))
    : (a = this.p2.date.exec(r))
    ? new Date().format(a[1])
    : this.result && (a = this.p2.result.exec(r))
    ? (this.result[a[1]] && this.result[a[1]][a[2]]) || ''
    : e;
}),
  (MagicVariableProcess.prototype.process = function (e) {
    return e.replace(this.pattern, this.handleMatch.bind(this));
  }),
  chrome.webRequest.onBeforeSendHeaders.addListener(
    myMod,
    {
      urls: ['http://*/*', 'https://*/*']
    },
    ['requestHeaders', 'blocking']
  ),
  chrome.runtime.onInstalled.addListener(function (e) {
    'install' == e.reason && window.open('about.html');
  });
