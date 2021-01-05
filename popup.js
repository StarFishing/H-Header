let button = document.querySelector('.h-header__switch');
let status = document.querySelector('.toggle-text');
function updateCallback() {
  console.log('更新成功');
}

button.addEventListener('click', e => {
  let flag = false;
  if (e.target.className.includes('h-header__switch-checked')) {
    e.target.className = e.target.className.replace(
      'h-header__switch-checked',
      ''
    );
  } else {
    e.target.className = e.target.className + ' h-header__switch-checked';
    flag = true;
  }

  status.innerText = flag ? '开启' : '关闭';

  chrome.runtime.sendMessage(
    {
      method: 'toggle',
      value: flag
    },
    updateCallback
  );
});

button = null;
