const { ipcRenderer } = require('electron')
const { contextBridge } = require('electron/renderer')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
  // we can also expose variables, not just functions
});

const wireUpButtons = () => {

  let closeButton = document.querySelector("#close-button");

  closeButton.addEventListener('click', function() {
    ipcRenderer.send('close-app');
  });

  let minimizeButton = document.querySelector("#minimize-button");

  minimizeButton.addEventListener('click', function() {
    ipcRenderer.send('minimize-app');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  wireUpButtons();
});