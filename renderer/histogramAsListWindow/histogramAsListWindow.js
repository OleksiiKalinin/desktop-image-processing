const {ipcRenderer} = require('electron');
const getCurrentWindow = require('electron').remote.getCurrentWindow;

ipcRenderer.send('hist_as_list_window_loaded', getCurrentWindow().id);

ipcRenderer.on('hist_as_list', (_, colourFrequencies) => {
    const wrapper = document.querySelector('.table');

    wrapper.innerHTML = `<tr><th>Value</th><th>Count</th></tr>`;

    colourFrequencies.forEach((fr, i) => {
        wrapper.innerHTML += `<tr><td>${i}</td><td>${fr}</td></tr>`;
    });
});