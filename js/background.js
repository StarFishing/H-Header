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
  chrome.storage.local.set({ isOpen });
}

let cache_data = [];
function getCacheData() {
  return cache_data;
}

function storageCacheData() {
  chrome.storage.local.set({ cache_data });
}
// 域名匹配
const development_url_reg = /^https{0,1}:\/\/localhost.*\/api/;
const replace_development_url = 'http://gogo.bytedance.net/api';

function filterCallback(e) {
  const requestHeaders = e.requestHeaders;
  if (isOpen) {
    cache_data.forEach(header => {
      if (header.open && header.default)
        requestHeaders.push({ name: header.key, value: header.default });
    });
  }

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
function handleMessage(config, origin, callback) {
  if (chrome.runtime.id == origin.id) {
    if (config.method === 'add-item' && config.value.key) {
      cache_data.push(config.value);
      storageCacheData();
    }
    if (config.method === 'deleteItem') {
      cache_data = cache_data.filter(item => {
        return config.key !== item.key;
      });
      storageCacheData();
    }
    if (config.method === 'updateItem') {
      const dataItem = cache_data.find(item => {
        return item.key === config.key;
      });
      if (dataItem) {
        dataItem.value.push(config.value);
        storageCacheData();
      }
    }
    if (config.method === 'openItem') {
      const dataItem = cache_data.find(item => {
        return item.key === config.key;
      });
      if (dataItem) {
        dataItem.default = config.value;
        storageCacheData();
      }
    }
    if (config.method === 'deleteItemValue') {
      const dataItem = cache_data.find(item => {
        return item.key === config.key;
      });
      if (dataItem) {
        dataItem.value = dataItem.value.filter(item => {
          return item !== config.value;
        });
        dataItem.default = dataItem.value[0];
        storageCacheData();
      }
    }
    if (config.method === 'toggleStatus') {
      const dataItem = cache_data.find(item => {
        return item.key === config.key;
      });
      if (dataItem) {
        dataItem.open = !dataItem.open;

        storageCacheData();
      }
    }

    if (callback) callback();
  }
}
chrome.runtime.onMessage.addListener(handleMessage);

function setup() {
  chrome.storage.local.get(['cache_data', 'isOpen'], res => {
    cache_data = res.cache_data || [];
    isOpen = res.isOpen || false;
  });
}
setup();
