function Toast(content, delay = 2000) {
  const template = `
  <div class="global-toast fade-in">
    <div class="content">${content}</div>
  </div>
  `;
  const element = document.createElement('div');
  element.setAttribute('class', 'global-toast-wrapper');
  element.innerHTML = template;
  document.body.append(element);

  setTimeout(() => {
    document.body.removeChild(element);
  }, delay);
}
