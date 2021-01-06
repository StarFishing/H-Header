'use strict';

chrome.browserAction.setBadgeText({ text: '2' });
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

chrome.contextMenus.create({
  title: '修改 Http-Header',
  onclick: function () {
    window.open('about.html');
  }
});

let isOpen = false;
function getIsOpen() {
  return isOpen;
}

function updateIsOpen(value) {
  isOpen = value;
}
// 域名匹配
const development_url_reg = /^https{0,1}:\/\/localhost.*\/api/;
const replace_development_url = 'http://gogo.bytedance.net/api';

function filterCallback(e) {
  const requestHeaders = e.requestHeaders;
  const url = e.url;
  requestHeaders.push({
    name: 'test',
    value: 'xiao'
  });
  return { requestHeaders };
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  filterCallback,
  {
    urls: ['http://*/*', 'https://*/*']
  },
  ['requestHeaders', 'blocking']
);

/**
 * 第二个参数包含插件的基本id信息
 */
chrome.runtime.onMessage.addListener((config, origin, callback) => {
  console.log(config, origin, callback);
});
