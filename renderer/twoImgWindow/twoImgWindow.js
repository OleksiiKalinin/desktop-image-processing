const { ipcRenderer } = require('electron');
const btns = document.querySelectorAll('.btn');
const submit = document.querySelector('.submit');
const getCurrentWindow = require('electron').remote.getCurrentWindow;
const cv = require('opencv4nodejs');
const dirname = require('electron').remote.getGlobal('appPath');
var uniqid = require('uniqid');
const histogram2d = require('../../MyFunctions/histogram2d.js');
let images = [];

ipcRenderer.on('funcName', (_, funcName) => {
    btns.forEach((btn, i) => {
        btn.addEventListener('click', function() {
            ipcRenderer.removeAllListeners('new-last-focused-window');
            ipcRenderer.send('get-new-last-focused-window', getCurrentWindow().id);
            ipcRenderer.on('new-last-focused-window', (_, src) => {
                let newSrc = src.split('\\').join('/');
                this.parentNode.children[0].src = newSrc;
                images[i] = newSrc;
            });
        });
    });
    
    submit.addEventListener('click', () => {
        img1 = cv.imread(images[0]);
        img2 = cv.imread(images[1]).resize(img1.rows, img1.cols);
        let dst = new cv.Mat();

        switch (funcName){
            case 'Add':
                dst = img1.add(img2);
                break;
            case 'Substract':
                dst = img1.sub(img2);
                break;
            case 'Blend':
                dst = img1.addWeighted(0.7, img2, 0.5, -100);
                break;
            case 'AND':
                dst = img1.bitwiseAnd(img2);
                break;
            case 'OR':
                dst = img1.bitwiseOr(img2);
                break;
            case 'NOT':
                dst = img1.bitwiseNot(img2);
                break;
            case 'XOR':
                dst = img1.bitwiseXor(img2);
                break;
            case 'Histogram 2D':
                img1Data = img1.cvtColor(cv.COLOR_RGBA2GRAY).getDataAsArray();
                img2Data = img2.cvtColor(cv.COLOR_RGBA2GRAY).getDataAsArray();
                hist2d = histogram2d(img1Data, img2Data);
                ipcRenderer.send('add-histogram2d-window', hist2d);
                return;
            default: break;
        }
        
        const lastIndex = images[0].lastIndexOf('.');
        const imgType = images[0].slice(lastIndex+1);
        const newUrl = `${dirname}\\${uniqid()}.${imgType}`;
        const newName = newUrl.substr(newUrl.lastIndexOf('\\')+1)
        
        cv.imwriteAsync(newUrl.split('\\').join('/'), dst)
        .then(() => {
            ipcRenderer.send('add-image-window', {name: newName, path: newUrl, type: imgType, size: 46879});
        });
    });
}); 
