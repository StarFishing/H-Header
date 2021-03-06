'use strict';

chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

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

function updateBadge(count) {
  chrome.browserAction.setBadgeText({ text: count ? count + '' : '' });
}

function getBadgeByData() {
  let count = 0;
  if (!isOpen) return 0;
  cache_data.forEach(data => {
    if (data.open && data.default) count++;
  });
  return count;
}

function filterCallback(e) {
  const requestHeaders = e.requestHeaders;
  let count = 0;
  if (isOpen) {
    cache_data.forEach(header => {
      if (header.open && header.default) {
        count++;
        requestHeaders.push({ name: header.key, value: header.default });
      }
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

function findDataItemById(id) {
  return cache_data.find(item => {
    return item.id === id;
  });
}

/**
 * 第二个参数包含插件的基本id信息
 */
function handleMessage(config, origin, callback) {
  if (chrome.runtime.id == origin.id) {
    if (config.method === 'add-item' && config.value.key) {
      cache_data.push(config.value);
    }
    if (config.method === 'deleteItem') {
      cache_data = cache_data.filter(item => {
        return config.id !== item.id;
      });
    }
    if (config.method === 'updateItem') {
      const dataItem = findDataItemById(config.id);
      if (dataItem) {
        dataItem.value.push(config.value);
      }
    }
    if (config.method === 'openItem') {
      const dataItem = findDataItemById(config.id);
      if (dataItem) {
        dataItem.default = dataItem.value[config.index];
      }
    }
    if (config.method === 'deleteItemValue') {
      const dataItem = findDataItemById(config.id);
      if (dataItem) {
        const index = +config.index;
        dataItem.value.splice(index, 1);
        dataItem.default = dataItem.value[0];
      }
    }
    if (config.method === 'toggleStatus') {
      const dataItem = findDataItemById(config.id);
      if (dataItem) {
        dataItem.open = !dataItem.open;
      }
    }
    storageCacheData();
    updateBadge(getBadgeByData());
    if (callback) callback();
  }
}
chrome.runtime.onMessage.addListener(handleMessage);
chrome.runtime.onInstalled.addListener(function (e) {
  'install' == e.reason && window.open('about.html');
});
function setup() {
  chrome.storage.local.get(['cache_data', 'isOpen'], res => {
    cache_data = res.cache_data || [];
    isOpen = res.isOpen || false;
    updateBadge(getBadgeByData());
  });
}
setup();
