// 获取background的导入
const bgJs = chrome.extension.getBackgroundPage();
let isOpen = bgJs.getIsOpen();
let editKey = null;

// 全局开关
let button = selector('.h-header__switch');
// 全局文字
let status = selector('.toggle-text');

function updateCallback() {
  console.log('更新成功');
}

function setGlobalKey(key) {
  editKey = key;
}

function updateCurrentStatus(e) {
  let target = e.target || e;

  if (!e.target) {
    if (isOpen) {
      addClass(target, 'h-header__switch-checked no-transition');
      status.innerText = '开启';
    }
    return;
  } else {
    removeClass(target, 'no-transition');
  }

  if (isOpen) {
    removeClass(target, 'h-header__switch-checked');
    isOpen = false;
  } else {
    addClass(target, 'h-header__switch-checked');
    isOpen = true;
  }

  status.innerText = isOpen ? '开启' : '关闭';
  bgJs.updateIsOpen(isOpen);

  sendMessage(
    {
      method: 'toggle',
      value: isOpen
    },
    updateCallback
  );
  target = null;
}

button.addEventListener('click', e => {
  updateCurrentStatus(e);
});

// 新增按钮
let actionCreate = selector('.option-item-action');
// 新增页
let headerCreate = selector('.h-header__create');
let headerContent = selector('.h-header__create .content');
// 新增返回
let createBack = selector('.h-header__create .create-back');
// // 编辑
// let editDoc = selector('.item-right .edit');
// 删除
let deleteIcon = selector('.h-header__create .delete-item');
// 创建
let createDialog = selector('.dialog-wrapper');
// 输入key
let inputKey = selector('.dialog .content-wrapper .content-input');
// 输入value
let inputValue = selector('.dialog .content-wrapper .content-textarea');

// 主页新增的确认取消
let footerConfirm = selector('.footer .confirm');
let footerCancel = selector('.footer .cancel');

// 列表容器
const parent = selector('.option-item__wrapper');

//发送按钮
const btnSend = selector('.h-header__create .send-value');
// 输入框内容
const inputSend = selector('.h-header__create .content-input');

// 创建
// editDoc.addEventListener('click', () => {
//   addClass(headerCreate, 'shown');
// });

actionCreate.addEventListener('click', () => {
  addClass(createDialog, 'shown');
});

function handleBack() {
  removeClass(headerCreate, 'shown');
  resetInputSend();
  patchTemplate();
}

// 返回
createBack.addEventListener('click', () => {
  handleBack();
});
deleteIcon.addEventListener('click', () => {
  sendMessage({ key: editKey, method: 'deleteItem' }, patchTemplate);
  handleBack();
});

footerConfirm.addEventListener('click', () => {
  handleSave();
  removeClass(createDialog, 'shown');
  handleReset();
});

footerCancel.addEventListener('click', () => {
  removeClass(createDialog, 'shown');
  handleReset();
});

headerContent.addEventListener('click', e => {
  e.stopPropagation();
  const className = e.target.className;
  const dataSet = e.target.dataset;
  if (!dataSet.value) return;
  if (className.includes('open')) {
    sendMessage(
      { key: editKey, value: dataSet.value, method: 'openItem' },
      addContent
    );
  }
  if (className.includes('delet')) {
    sendMessage(
      { key: editKey, value: dataSet.value, method: 'deleteItemValue' },
      addContent
    );
  }
});

inputSend.addEventListener('input', event => {
  const value = event.target.value;
  if (value.trim()) btnSend.disabled = false;
  else btnSend.disabled = true;
});

btnSend.addEventListener('click', () => {
  const value = inputSend.value.trim();
  sendMessage({ method: 'updateItem', key: editKey, value }, addContent);
  resetInputSend();
});

// 列表点击事件统一托管到这里
parent.addEventListener('click', e => {
  e.stopPropagation();
  const key = e.target.dataset.key;
  if (!key) return;

  const className = e.target.className;
  if (className.includes('edit')) {
    addClass(headerCreate, 'shown');
    setGlobalKey(key);
    addContent(key);
  }
  if (className.includes('toggle-status')) {
    sendMessage({ key, method: 'toggleStatus' }, patchTemplate);
  }
});

function resetInputSend() {
  inputSend.value = '';
  btnSend.disabled = true;
}

/**
 * 根据唯一key展示所有value
 * @param {*} key
 */
function addContent(key) {
  const currentKey = key || editKey;
  const cache_data = bgJs.getCacheData();
  const current_value = cache_data.find(item => {
    return item.key === currentKey;
  });
  if (!current_value) return;
  let str = '<ul>';
  current_value.value.forEach(item => {
    str += `
    <li class="option-item">
      <div class="item-left">
      <div class="item-left__status">
        ${
          current_value.default === item
            ? '<img src="img/确认.svg" class="icon" />'
            : ''
        }
        </div>
        <div class="item-value">${item}</div>
      </div>
      <div class="item-right">
        <div class="edit open" data-value=${item}>启用</div>
        <div class="delet" data-value=${item}>删除</div>
      </div>
    </li>
    `;
  });
  str += '</ul>';
  headerContent.innerHTML = str;
}

function handleSave() {
  const key = inputKey.value;
  const value = inputValue.value.split('\n');
  const valueList = value
    .map(item => {
      return item.replace(/[\r\n]/g, '').trim();
    })
    .filter(item => {
      return !!item;
    });

  const config = {
    method: 'add-item',
    value: {
      key,
      value: valueList,
      open: true,
      default: valueList[0]
    }
  };

  sendMessage(config, patchTemplate);

  return config;
}

function handleReset() {
  // 重置
  inputKey.value = '';
  inputValue.value = '';
}

function patchTemplate() {
  const cache_data = bgJs.getCacheData();
  let template = '';
  cache_data.forEach(data => {
    template += `
    <li class="option-item">
        <div class="item-left">
            <div class="item-key">${data.key}</div>
            <div class="item-value">${
              data.default ? data.default : '@AUTO'
            }</div>
        </div>
        <div class="item-right">
            <div class="edit" data-key=${data.key}>编辑</div>
            <div class="toggle-status  ${
              data.open ? 'warning' : 'success'
            }" data-key=${data.key}>${data.open ? '禁用' : '启用'}</div>
        </div>
    </li>`;
  });

  parent.innerHTML = template;

  parent.append(actionCreate);
}

// 首次初始化状态
updateCurrentStatus(button);
patchTemplate();
button = null;
