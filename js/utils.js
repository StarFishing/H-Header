function selector(className) {
  return document.querySelector(className);
}

function removeClass(el, className) {
  if (!hasClass(el, className)) {
    return;
  }
  let newClass = el.className.split(' ');
  let index = newClass.findIndex(item => {
    return item === className;
  });
  newClass.splice(index, 1);
  el.className = newClass.join(' ');
}

function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
  return reg.test(el.className);
}

function addClass(el, className) {
  if (hasClass(el, className)) {
    return;
  }
  let newClass = el.className.split(' ');
  newClass.push(className);
  el.className = newClass.join(' ');
}

function sendMessage(config, callback) {
  return chrome.runtime.sendMessage(config, callback);
}

function addEventListener(ele, type, callback) {
  ele.addEventListener(type, function (e) {
    e.stopPropagation();
    callback(e);
  });
}

function uuid() {
  var s = [];
  var hexDigits = '0123456789abcdef';
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  var uuid = s.join('');
  return uuid;
}
