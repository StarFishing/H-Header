// 获取background的导入
const bgJs = chrome.extension.getBackgroundPage();
let isOpen = bgJs.getIsOpen();
console.log(isOpen);
// 全局开关
let button = document.querySelector('.h-header__switch');
// 全局文字
let status = document.querySelector('.toggle-text');

function updateCallback() {
  console.log('更新成功');
}

function updateCurrentStatus(e) {
  let target = e.target || e;

  if (!e.target) {
    if (isOpen) {
      target.className = target.className + ' h-header__switch-checked';
      status.innerText = '开启';
    }
    return;
  }

  if (isOpen) {
    target.className = target.className.replace('h-header__switch-checked', '');
    isOpen = false;
  } else {
    target.className = target.className + ' h-header__switch-checked';
    isOpen = true;
  }

  status.innerText = isOpen ? '开启' : '关闭';
  bgJs.updateIsOpen(isOpen);

  chrome.runtime.sendMessage(
    {
      method: 'toggle',
      value: isOpen
    },
    updateCallback
  );
  target = null;
}
// 首次初始化状态
updateCurrentStatus(button);

button.addEventListener('click', e => {
  updateCurrentStatus(e);
});

// 新增按钮
let actionCreate = document.querySelector('.option-item-action');
// 新增页
let headerCreate = document.querySelector('.h-header__create');
// 新增返回
let createBack = document.querySelector('.h-header__create .create-back');

let editDoc = document.querySelector('.item-right .edit');
let deleteDoc = document.querySelector('.item-right .delet');

let createDialog = document.querySelector('.dialog.h-header__edit-card');

// 主页新增的确认取消
let footerConfirm = document.querySelector('.footer .confirm');
let footerCancel = document.querySelector('.footer .cancel');
// 创建
editDoc.addEventListener('click', () => {
  headerCreate.className = headerCreate.className + ' shown';
});

actionCreate.addEventListener('click', () => {
  createDialog.className = createDialog.className + ' shown';
});

// 返回
createBack.addEventListener('click', () => {
  headerCreate.className = headerCreate.className.replace('shown', '');
});

footerConfirm.addEventListener('click', () => {
  // TODO 有保存逻辑
  createDialog.className = createDialog.className.replace('shown', '');
});

footerCancel.addEventListener('click', () => {
  createDialog.className = createDialog.className.replace('shown', '');
});

button = null;
