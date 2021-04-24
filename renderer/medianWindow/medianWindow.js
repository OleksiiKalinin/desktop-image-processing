const { ipcRenderer } = require('electron');
const radioSize = document.querySelectorAll('input[name="size"]');
const radioBorder = document.querySelectorAll('input[name="border"]');
const submit = document.querySelector('.submit');

submit.addEventListener('click', () => {
    let size = null, border;

    radioSize.forEach(radio => {
        if (radio.checked) size = +radio.value;
    }); 
    radioBorder.forEach(radio => {
        if (radio.checked) border = +radio.value;
    }); 
    
    if (size  !== null && border !== null) {
        ipcRenderer.send('navbar-opencv-methods', 'median', {size, border});
    }
});