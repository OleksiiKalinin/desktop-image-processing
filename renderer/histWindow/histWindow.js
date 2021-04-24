const {ipcRenderer} = require('electron');
const createHistogram = require('../createHistogram/createHistogram.js');
const slider = require('../slider/slider.js');
const wrapper = document.querySelector('.wrapper');
const getCurrentWindow = require('electron').remote.getCurrentWindow;

ipcRenderer.send('hist_window_loaded', '');

let colourFrequencies = [];

ipcRenderer.on('image_data', (_, {bitmap, type}) => {
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
        wrapper.innerHTML = histgray.svgstring;
        wrapper.innerHTML += `
            <div class="slider-dot-wrapper">
                <div class='slider-dot hist_list' onClick={onListHistogram()}>List</div>
            </div>`;
        colourFrequencies.push(histgray.colourFrequencies);
    }
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
}

{/* <div class="btn_prev">
    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width='100%' height='100%' viewBox="0 0 443.52 443.52" style="enable-background:new 0 0 443.52 443.52;" xml:space="preserve">
        <path fill="#000000" d="M143.492,221.863L336.226,29.129c6.663-6.664,6.663-17.468,0-24.132c-6.665-6.662-17.468-6.662-24.132,0l-204.8,204.8c-6.662,6.664-6.662,17.468,0,24.132l204.8,204.8c6.78,6.548,17.584,6.36,24.132-0.42c6.387-6.614,6.387-17.099,0-23.712L143.492,221.863z"/>
    </svg>
</div>
<div class="btn_next">
    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width='100%' height='100%' viewBox="0 0 443.52 443.52" style="enable-background:new 0 0 443.52 443.52;" xml:space="preserve">
        <path fill="#000000" d="M336.226,209.591l-204.8-204.8c-6.78-6.548-17.584-6.36-24.132,0.42c-6.388,6.614-6.388,17.099,0,23.712l192.734,192.734L107.294,414.391c-6.663,6.664-6.663,17.468,0,24.132c6.665,6.663,17.468,6.663,24.132,0l204.8-204.8C342.889,227.058,342.889,216.255,336.226,209.591z"/>
    </svg>
</div>  */}