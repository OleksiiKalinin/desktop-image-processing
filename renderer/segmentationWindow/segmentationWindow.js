const slider = document.getElementById('slider');
const sliderValue = document.getElementById('sliderValue');
const { ipcRenderer } = require('electron');
const selectSize = document.querySelector('#size');
const allRadio = document.querySelectorAll('input[type="radio"]');
const headers = document.querySelectorAll('h4');
const submit = document.querySelector('.submit');
const reset = document.querySelector('.reset');
let currentThresh = 127;
let currentAdaptiveThresh = 3;
let selectedMethod = null;

allRadio.forEach(radio => {
    radio.addEventListener('click', () => {
        selectedMethod = +document.querySelector('input:checked').value;
        preview(selectedMethod);
    }); 
}); 

headers.forEach((header, i) => {
    header.addEventListener('click', () => {
        allRadio[i].click();
    });
});

selectSize.addEventListener('change', function() {
    currentAdaptiveThresh = +this.value;
    allRadio[1].click();
});

slider.onmousedown = () => {
    slider.onmousemove = (e) => {
        currentThresh = +e.target.value;
        sliderValue.children[0].textContent = currentThresh;
        allRadio[0].click();
    }

    slider.onmouseup = (e) => {
        slider.onmousemove = null;
        currentThresh = +e.target.value;
        sliderValue.children[0].textContent = currentThresh;
        allRadio[0].click();
    }
}

function preview(method) {
    const thresh = method === 0 ? currentThresh : method === 1 ? currentAdaptiveThresh : null;
    ipcRenderer.send('navbar-opencv-methods', 'segmentation', {method, thresh});
}

reset.addEventListener('click', () => {
    ipcRenderer.send('navbar-opencv-methods', 'segmentation', {reset: true});
    resetRadio();
    
});

submit.addEventListener('click', () => {
    ipcRenderer.send('navbar-opencv-methods', 'segmentation', {submit: true});
    resetRadio();
});

function resetRadio() {
    allRadio.forEach(radio => radio.checked = false);
}