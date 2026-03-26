async function init() {
  console.log('🚀 MVP Dashboard');
  await window.Core.init();
  window.Router.init();
  await window.AuthService.loginGuest();
  await window.Core.loadModule('tasks');
}

init();