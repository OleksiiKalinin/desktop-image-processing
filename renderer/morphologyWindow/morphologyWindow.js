const { ipcRenderer } = require('electron');
const selectSize = document.querySelector('#size');
const radioBorder = document.querySelectorAll('input[name="border"]');
const radioOperation = document.querySelectorAll('input[name="operation"]');
const radioShape = document.querySelectorAll('input[name="shape"]');
const submit = document.querySelector('.submit');

submit.addEventListener('click', () => {
    let size = null, border = null, operation = null, shape = null;

    size = +selectSize.value;
        
    radioBorder.forEach(radio => {
        if (radio.checked) border = +radio.value;
    });   

    radioOperation.forEach(radio => {
        if (radio.checked) operation = +radio.value;
    });   

    radioShape.forEach(radio => {
        if (radio.checked) shape = +radio.value;
    }); 
    
    if (size  !== null && border !== null && operation !== null && shape !== null) {
        ipcRenderer.send('navbar-opencv-methods', 'morphology', {size, border, operation, shape});
    }
});