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

function addEventListener(type, callback) {
  document.addEventListener(type, callback, true);
}
