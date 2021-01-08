// 获取background的导入
const bgJs = chrome.extension.getBackgroundPage();
let isOpen = bgJs.getIsOpen();
let editKey = null;
let editId = null;

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

function setGlobalId(id) {
  editId = id;
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

// button.addEventListener('click', e => {
//   updateCurrentStatus(e);
// });

addEventListener(button, 'click', e => {
  updateCurrentStatus(e);
});

// 新增按钮
let actionCreate = selector('.option-item-action');
// 新增页
let headerCreate = selector('.h-header__create');
let headerContent = selector('.h-header__create .content');
// 新增返回
let createBack = selector('.h-header__create .create-back');

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

// actionCreate.addEventListener('click', () => {
//   addClass(createDialog, 'shown');
// });

addEventListener(actionCreate, 'click', () => {
  addClass(createDialog, 'shown');
});

function handleBack() {
  removeClass(headerCreate, 'shown');
  resetInputSend();
  patchTemplate();
}

// 返回
// createBack.addEventListener('click', () => {
//   handleBack();
// });
addEventListener(createBack, 'click', () => {
  handleBack();
});
// deleteIcon.addEventListener('click', () => {
//   sendMessage({ id: editId, method: 'deleteItem' }, patchTemplate);
//   handleBack();
// });
addEventListener(deleteIcon, 'click', () => {
  sendMessage({ id: editId, method: 'deleteItem' }, patchTemplate);
  handleBack();
});

// footerConfirm.addEventListener('click', () => {
//   handleSave();
//   removeClass(createDialog, 'shown');
//   handleReset();
// });

addEventListener(footerConfirm, 'click', () => {
  handleSave();
  removeClass(createDialog, 'shown');
  handleReset();
});

addEventListener(footerCancel, 'click', () => {
  removeClass(createDialog, 'shown');
  handleReset();
});

addEventListener(headerContent, 'click', e => {
  e.stopPropagation();
  const className = e.target.className;
  const dataSet = e.target.dataset;
  if (!dataSet.index) return;
  if (className.includes('open')) {
    sendMessage(
      { id: editId, index: dataSet.index, method: 'openItem' },
      addContent
    );
  }
  if (className.includes('delet')) {
    sendMessage(
      { id: editId, index: dataSet.index, method: 'deleteItemValue' },
      addContent
    );
  }
});

addEventListener(inputSend, 'input', event => {
  const value = event.target.value;
  if (value.trim()) btnSend.disabled = false;
  else btnSend.disabled = true;
});
addEventListener(btnSend, 'click', () => {
  const value = inputSend.value.trim();
  sendMessage({ method: 'updateItem', id: editId, value }, addContent);
  resetInputSend();
});

// 列表点击事件统一托管到这里
addEventListener(parent, 'click', e => {
  e.stopPropagation();
  const id = e.target.dataset.id;
  if (!id) return;

  const className = e.target.className;
  if (className.includes('edit')) {
    addClass(headerCreate, 'shown');
    setGlobalId(id);
    addContent();
  }
  if (className.includes('toggle-status')) {
    sendMessage({ id, method: 'toggleStatus' }, patchTemplate);
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
  const currentKey = key || editId;
  const cache_data = bgJs.getCacheData();
  const current_value = cache_data.find(item => {
    return item.id === currentKey;
  });
  if (!current_value) return;
  let str = '<ul>';
  current_value.value.forEach((item, index) => {
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
        <div class="edit open" data-index=${index}>启用</div>
        <div class="delet" data-index=${index}>删除</div>
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
      id: uuid(),
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
            <div class="edit" data-id=${data.id}>编辑</div>
            <div class="toggle-status  ${
              data.open ? 'warning' : 'success'
            }" data-id=${data.id}>${data.open ? '禁用' : '启用'}</div>
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
