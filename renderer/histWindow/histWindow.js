const {ipcRenderer} = require('electron');
const createHistogram = require('../createHistogram/createHistogram.js');
const slider = require('../slider/slider.js');
const wrapper = document.querySelector('.wrapper');
const getCurrentWindow = require('electron').remote.getCurrentWindow;

ipcRenderer.send('hist_window_loaded', '');

let colourFrequencies = [], histAsListAlreadyOpened = false;

ipcRenderer.on('image_data', (_, {bitmap, type}) => {
    colourFrequencies = [];
    if (type) {
        const histred = createHistogram.histogram(createHistogram.colorChannels.Red, bitmap.data);
        const histgreen = createHistogram.histogram(createHistogram.colorChannels.Green, bitmap.data);
        const histblue = createHistogram.histogram(createHistogram.colorChannels.Blue, bitmap.data);
        const histRGB = createHistogram.histogram(createHistogram.colorChannels.Gray, bitmap.data);

        colourFrequencies.push(histred.colourFrequencies, histgreen.colourFrequencies, histblue.colourFrequencies, histRGB.colourFrequencies)
        
        wrapper.innerHTML = `
            <div class="slider">
                <div class="slider_container">
                    <div class="slider_track">
                        <div class="slider_item hist_red">${histred.svgstring}</div>
                        <div class="slider_item hist_green">${histgreen.svgstring}</div>
                        <div class="slider_item hist_blue">${histblue.svgstring}</div>
                        <div class="slider_item hist_rgb">${histRGB.svgstring}</div>
                    </div>
                </div>
            </div> 
            <div class="slider-dot-wrapper">
                <div class='slider-dot hist_list' onClick={onListHistogram()}>List</div>
            </div>`;

        slider.slider({
            dot: '.slider-dot-wrapper',
            slide: '.slider_item',
            // nextArrow: '.btn_next',
            // prevArrow: '.btn_prev',
            wrapper: '.slider_container',
            field: '.slider_track',
            dotsNames: ['Red', 'Green', 'Blue', 'R+G+B']
        });
    } else {
        const histgray = createHistogram.histogram(createHistogram.colorChannels.Gray, bitmap.data);
        colourFrequencies.push(histgray.colourFrequencies);
        wrapper.innerHTML = histgray.svgstring;
        wrapper.innerHTML += `
            <div class="slider-dot-wrapper">
                <div class='slider-dot hist_list' onClick={onListHistogram()}>List</div>
            </div>`;
    }
    if (histAsListAlreadyOpened) onListHistogram();
});

function onListHistogram() {
    let arrayOfFrequencies;
    try {
        const indexOfArray = document.querySelector('[data-current="true"]').getAttribute('data-index');
        arrayOfFrequencies = colourFrequencies[indexOfArray - 1];
    } catch {
        arrayOfFrequencies = colourFrequencies[0];
    }
    ipcRenderer.send('add_hist_as_list_window', arrayOfFrequencies, getCurrentWindow().id);    
    histAsListAlreadyOpened = true;
}