const path = require('path');
const fs = require('fs');
const rimraf = require("rimraf");
const url = require('url');
const {app, BrowserWindow, ipcMain} = require('electron');
const Jimp = require('jimp');
const createHistogram = require('./renderer/createHistogram/createHistogram.js');
const normalize = require('./MyFunctions/normalize.js');
const equalize = require('./MyFunctions/equalize.js');
const posterize = require('./MyFunctions/posterize.js');
const progowaniezps = require('./MyFunctions/progowaniezps.js');
const progowanie = require('./MyFunctions/progowanie.js');
var uniqid = require('uniqid');
const cv = require('opencv4nodejs');
// const tf = require('@tensorflow/tfjs');

try{ require('electron-reload')(__dirname)} catch{}

let mainWindow, imageWindow, histogramWindow, 
    histogramAsListWindow, plotProfileWindow, 
    moreFiltersWindow, medianWindow, morphologyWindow,
    lastFocusedWindow, lastFocusedWindows = [],
    windows_data = [], whoOpenedHistogram = [],
    histogramAsList, whoOpenedHistogramAsList = [],
    plotProfileData = [], whoOpenedPlotProfile = [];

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 400,
        autoHideMenuBar: true
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer', 'index', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // mainWindow.webContents.openDevTools()

    mainWindow.on('closed', () => {
        app.quit();
        rimraf.sync(global.appPath);
    });
};

ipcMain.on('add-image-window', (_, fileData) => {
    Jimp.read(fileData.path, (err, img) => {
        if (err) throw err;

        const imgHeight = img.bitmap.height;
        const imgWidth = img.bitmap.width;
        const imgData = img.bitmap;
        const imgName = fileData.name;
        const imgUrl = fileData.path;
        const imgType = isImageColorful(fileData.type, imgData);
        const imgSize = fileData.size;
        
        imageWindow = new BrowserWindow({
            width: imgWidth + 6,
            height: imgHeight + 7 + 22,
            autoHideMenuBar: true,
            // resizable: false,
            //parent: mainWindow,
            title: `${imgName}: ${imgWidth}x${imgHeight}; ${imgType ? 'RGB' : '8-bit'}; ${(imgSize / 1024).toFixed(1)} KB`
        });

        imageWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'renderer', 'imgWindow', 'imgWindow.html'),
            protocol: 'file:',
            slashes: true
        }));

        const winId = imageWindow.id;

        imageWindow.on('closed', () => {
            imageWindow = null;
            const newArr = lastFocusedWindows.filter(item => item !== winId);
            lastFocusedWindows = [...newArr];
            lastFocusedWindow = lastFocusedWindows[lastFocusedWindows.length - 1];
        });

        imageWindow.focus();
        lastFocusedWindows.push(winId);
        lastFocusedWindow = lastFocusedWindows[lastFocusedWindows.length - 1];
        windows_data.push({
            id: winId,
            imgUrl,
            imgData,
            imgType,
            imgHeight,
            imgWidth
        });
        // imageWindow.webContents.openDevTools()
    });
});

function isImageColorful(type, imgData) {
    const cleanedType = type.replace(/image\//, '');

    switch (cleanedType) {
        case 'bmp':
            return imgData.bitPP === 24 ? true : false;
        case 'png':
            return imgData.color ? true : false;
        case 'jpeg':
            return imgData.exifBuffer ? true : false;
        case 'tiff':
            return (imgData.data[0] === imgData.data[1] ? imgData.data[1] : '') === imgData.data[2] ? false : true;
        default:
            break;
    }
}

ipcMain.on('image_window_loaded', () => {
    const {imgUrl, imgHeight, imgWidth} = windows_data[windows_data.length - 1];
    imageWindow.webContents.send('url', {imgUrl, imgHeight, imgWidth});
});

ipcMain.on('last_focused', (_, id) => {
    lastFocusedWindows.push(id);
    lastFocusedWindow = lastFocusedWindows[lastFocusedWindows.length - 1];
});

ipcMain.on('add-histogram-window', () => {
    addHistogramWindow();
});

function addHistogramWindow(flag = false) {
    let isExist = null, tempObj = {};

    whoOpenedHistogram.forEach((obj, i) => {
        if (obj.idParent === lastFocusedWindow) {
            isExist = i;
            tempObj['p'] = obj.idParent;
            tempObj['c'] = obj.idChild;
        }
    });

    if (lastFocusedWindows.length !== 0) {
        if (isExist === null) {
            if (flag) return;
            histogramWindow = new BrowserWindow({
                width: 400,
                height: 310,
                autoHideMenuBar: true,
                // resizable: false,
                //parent: mainWindow,
                title: 'Histogram of ' + BrowserWindow.fromId(lastFocusedWindow).getTitle().replace(/\:.*/, '')
            });

            histogramWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'renderer', 'histWindow', 'histWindow.html'),
                protocol: 'file:',
                slashes: true
            }));

            let histWinId = histogramWindow.id;

            whoOpenedHistogram.push({
                idParent: lastFocusedWindow,
                idChild: histWinId
            });

            histogramWindow.on('closed', () => {
                histogramWindow = null;

                let index;
                whoOpenedHistogram.forEach((obj, i) => {
                    if (obj.idChild === histWinId) {
                        index = i;
                    }
                });
                whoOpenedHistogram = [
                    ...whoOpenedHistogram.slice(0, index),
                    ...whoOpenedHistogram.slice(index + 1)
                ];
            });

            histogramWindow.focus();

            // histogramWindow.webContents.openDevTools()
        } else {
            let data;
            windows_data.forEach(win => {
                if (win.id === lastFocusedWindow) {
                    data = {
                        bitmap: win.imgData,
                        type: win.imgType
                    }
                }
            });

            BrowserWindow.fromId(tempObj.c).webContents.send('image_data', data);
        }
    } else {
        createErrorWindow();
    }
}

ipcMain.on('hist_window_loaded', () => {
    let data;
    windows_data.forEach(win => {
        if (win.id === lastFocusedWindow) {
            data = {
                bitmap: win.imgData,
                type: win.imgType
            }
        }
    });

    histogramWindow.webContents.send('image_data', data);
});

ipcMain.on('add_hist_as_list_window', (_, array, idOfImageWindow) => {
    histogramAsList = array;

    let index = null,
        tempObj = {};
    whoOpenedHistogramAsList.forEach((obj, i) => {
        if (obj.idParent === idOfImageWindow) {
            index = i;
            tempObj['p'] = obj.idParent;
            tempObj['c'] = obj.idChild;
        }
    });

    if (index === null) {
        histogramAsListWindow = new BrowserWindow({
            width: 300,
            height: 500,
            autoHideMenuBar: true,
            // resizable: false,
            //parent: mainWindow,
            title: BrowserWindow.fromId(idOfImageWindow).getTitle()
        });

        histogramAsListWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'renderer', 'histogramAsListWindow', 'histogramAsListWindow.html'),
            protocol: 'file:',
            slashes: true
        }));

        whoOpenedHistogramAsList.push({
            idParent: idOfImageWindow,
            idChild: histogramAsListWindow.id
        }) - 1;

        histogramAsListWindow.on('closed', () => {
            histogramAsListWindow = null;
        });
    } else {
        BrowserWindow.fromId(tempObj.c).webContents.send('hist_as_list', histogramAsList);
    }

    histogramAsListWindow.focus();

    // histogramAsListWindow.webContents.openDevTools()
});

ipcMain.on('hist_as_list_window_loaded', (_, id) => {
    BrowserWindow.fromId(id).webContents.send('hist_as_list', histogramAsList);
});

ipcMain.on('add-plot-profile-window', () => {
    let isExist = null, tempObj = {};

    whoOpenedPlotProfile.forEach((obj, i) => {
        if (obj.idParent === lastFocusedWindow) {
            isExist = i;
            tempObj['p'] = obj.idParent;
            tempObj['c'] = obj.idChild;
        }
    });

    if (lastFocusedWindows.length !== 0) {
        if (isExist === null) {
            plotProfileWindow = new BrowserWindow({
                width: 500,
                height: 360,
                autoHideMenuBar: true,
                // resizable: false,
                //parent: mainWindow,
                title: 'Plot of ' + BrowserWindow.fromId(lastFocusedWindow).getTitle().replace(/\:.*/, '')
            });

            plotProfileWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'renderer', 'plotProfileWindow', 'plotProfileWindow.html'),
                protocol: 'file:',
                slashes: true
            }));

            let plotWinId = plotProfileWindow.id;

            whoOpenedPlotProfile.push({
                idParent: lastFocusedWindow,
                idChild: plotWinId
            });


            plotProfileWindow.on('closed', () => {
                histogramWindow = null

                let index;
                whoOpenedPlotProfile.forEach((obj, i) => {
                    if (obj.idChild === plotWinId) {
                        index = i;
                    }
                });
                whoOpenedPlotProfile = [
                    ...whoOpenedPlotProfile.slice(0, index),
                    ...whoOpenedPlotProfile.slice(index + 1)
                ];
            });

            plotProfileWindow.focus();

            // plotProfileWindow.webContents.openDevTools()
        } else {
            let data;
            plotProfileData.forEach(plot => data = plot.id === lastFocusedWindow ? plot.plotData : []);

            BrowserWindow.fromId(tempObj.c).webContents.send('plot_data', data);
        }
    } else {
        createErrorWindow();
    }
});

ipcMain.on('add-more-filters-window', () => {
    if (!moreFiltersWindow) {
        moreFiltersWindow = new BrowserWindow({
            width: 620,
            height: 630,
            autoHideMenuBar: true,
            resizable: false,
            //parent: mainWindow
        });

        moreFiltersWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'renderer', 'moreFiltersWindow', 'moreFiltersWindow.html'),
            protocol: 'file:',
            slashes: true
        }));

        moreFiltersWindow.focus();
        
        moreFiltersWindow.on('closed', () => {
            moreFiltersWindow = null;
        });

        // moreFiltersWindow.webContents.openDevTools()
    } else {moreFiltersWindow.focus()}
});

ipcMain.on('add-median-window', () => {
    if (!medianWindow) {
        medianWindow = new BrowserWindow({
            width: 320,
            height: 280,
            autoHideMenuBar: true,
            resizable: false,
            //parent: mainWindow
        });

        medianWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'renderer', 'medianWindow', 'medianWindow.html'),
            protocol: 'file:',
            slashes: true
        }));

        medianWindow.focus();
        
        medianWindow.on('closed', () => {
            medianWindow = null;
        });

        // medianWindow.webContents.openDevTools()
    } else {medianWindow.focus()}
});

ipcMain.on('add-morphology-window', () => {
    if (!morphologyWindow) {
        morphologyWindow = new BrowserWindow({
            width: 560,
            height: 450,
            autoHideMenuBar: true,
            resizable: false,
            //parent: mainWindow
        });

        morphologyWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'renderer', 'morphologyWindow', 'morphologyWindow.html'),
            protocol: 'file:',
            slashes: true
        }));

        morphologyWindow.focus();
        
        morphologyWindow.on('closed', () => {
            morphologyWindow = null;
        });

        // morphologyWindow.webContents.openDevTools()
    } else {morphologyWindow.focus()}
});

ipcMain.on('plot_profile_window_loaded', () => {
    let data;
    plotProfileData.forEach(plot => data = plot.id === lastFocusedWindow ? plot.plotData : []);

    plotProfileWindow.webContents.send('plot_data', data);
});

ipcMain.on('new_plot_data', (_, plotData, winId) => {
    whoOpenedPlotProfile.forEach(obj => {
        if (obj.idParent === winId)
            BrowserWindow.fromId(obj.idChild).webContents.send('plot_data', plotData);
    });
});

ipcMain.on('navbar-own-methods', (_, method, extra) => {
    let bitmap = [], url = '', id = '';
    windows_data.forEach(win => {
        if (win.id === lastFocusedWindow) {
            bitmap = [...win.imgData.data];
            url = win.imgUrl;
            id = win.id;
        }
    });

    switch(method) {
        case 'normalize':
            bitmap = normalize(bitmap, extra.Lmax);
            break;
        case 'equalize':
            const {colourFrequencies} = createHistogram.histogram(createHistogram.colorChannels.Gray, bitmap);
            const lut = equalize(colourFrequencies);
            for (let i = 0; i < bitmap.length; i++) 
                if ((i + 1) % 4 !== 0) bitmap[i] = lut[bitmap[i]];
            break;
        case 'negacja':
            for (let i = 0; i < bitmap.length; i++) 
                if ((i + 1) % 4 !== 0) bitmap[i] = 255 - bitmap[i];
            break;
        case 'progowanie':
            bitmap = progowanie(bitmap, extra.prog);
            break;
        case 'progowanie-zps':
            bitmap = progowaniezps(bitmap, extra.p1, extra.p2);
            break;
        case 'posterize':
            bitmap = posterize(bitmap, extra.count);
            break;
        default: break;
    }

    Jimp.read(url, async (err, img) => {
        if (err) {
          console.log(err);
        } else {
            img.bitmap.data = [...bitmap];

            const imgType = img._originalMime.split('/')[1];
            const imgHeight = img.bitmap.height;
            const imgWidth = img.bitmap.width;
            const newUrl = `${global.appPath}\\${uniqid()}.${imgType}`;
            const objIndex = windows_data.findIndex((obj => obj.id === id));

            windows_data[objIndex].imgUrl = newUrl;
            windows_data[objIndex].imgData.data = [...img.bitmap.data];
            
            await img.writeAsync(newUrl);
            addHistogramWindow(true);
            BrowserWindow.fromId(id).webContents.send('url', {imgUrl: newUrl, imgHeight, imgWidth});
        }
    });
});

ipcMain.on('navbar-opencv-methods', async (_, method, extra) => {
    let url = '', id = '';

    windows_data.forEach(win => {
        if (win.id === lastFocusedWindow) {
            bitmap = [...win.imgData.data];
            url = win.imgUrl;
            id = win.id;
        }
    });

    let src = cv.imread(url.split('\\').join('/')).cvtColor(cv.COLOR_RGB2GRAY);
    let dst = new cv.Mat();
    let ksize = new cv.Size(3, 3);

    switch (method) {
        case 'blur': 
            dst = src.blur(ksize, new cv.Point(-1, -1), cv.BORDER_DEFAULT);
            break;
        case 'gaussianBlur': 
            dst = src.gaussianBlur(ksize, 0, 0, cv.BORDER_DEFAULT);
            break;
        case 'sobel': 
            dst = src.sobel(cv.CV_8U, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
            break;
        case 'laplacian': 
            dst = src.laplacian(cv.CV_8U, 1, 1, 0, cv.BORDER_DEFAULT);
            break;
        case 'canny': 
            dst = src.canny(100, 200);
            break;
        case 'filter2d': 
            // let temp = [[1,1,0],[1,0,-1],[0,-1,-1]];
            // dst = src.filter2D(cv.CV_64F, new cv.Mat(3, 3, cv.CV_32FC1, new Buffer.from(temp)), anchor, 0, cv.BORDER_REPLICATE)
            break;
        case 'median': 
            {
                let size, border;

                if (extra.size === 0){
                    size = 3;
                } else  if (extra.size === 1){
                    size = 5;
                } else if (extra.size === 2){
                    size = 7;
                }

                if (extra.border === 0){
                    border = cv.BORDER_ISOLATED;
                } else  if (extra.border === 1){
                    border = cv.BORDER_REFLECT;
                } else if (extra.border === 2){
                    border = cv.BORDER_REPLICATE;
                }
                
                dst = src.copyMakeBorder(1, 1, 1, 1, border).medianBlur(size);
            }
            break;
        case 'morphology':
            {
                let border, operation, shape, isSkeleton = false;

                if (extra.operation === 0){
                    operation = cv.MORPH_ERODE;
                } else  if (extra.operation === 1){
                    operation = cv.MORPH_DILATE;
                } else if (extra.operation === 2){
                    operation = cv.MORPH_OPEN;
                } else if (extra.operation === 3){
                    operation = cv.MORPH_CLOSE;
                } else if (extra.operation === 4){
                    isSkeleton = true;
                }

                if (extra.shape === 0){
                    shape = cv.MORPH_RECT;
                } else  if (extra.shape === 1){
                    shape = cv.MORPH_ELLIPSE;
                } else if (extra.shape === 2){
                    shape = cv.MORPH_CROSS;
                }

                if (extra.border === 0){
                    border = cv.BORDER_ISOLATED;
                } else  if (extra.border === 1){
                    border = cv.BORDER_REFLECT;
                } else if (extra.border === 2){
                    border = cv.BORDER_REFLECT_101;
                } else if (extra.border === 3){
                    border = cv.BORDER_REPLICATE;
                } else if (extra.border === 4){
                    border = cv.BORDER_CONSTANT;
                }

                if (!isSkeleton)
                    dst = src.morphologyEx(cv.getStructuringElement(shape, new cv.Size(extra.size, extra.size)), operation, new cv.Point(-1, -1), 1, border);
                else {
                    let skeleton = new cv.Mat(src.rows, src.cols, cv.CV_8UC1, 0);
                    let srcCopy = src.threshold(127, 255, cv.THRESH_BINARY).copy();
                    let element = cv.getStructuringElement(shape, new cv.Size(extra.size, extra.size));
                    
                    while (true) {
                        let srcOpen = srcCopy.morphologyEx(element, cv.MORPH_OPEN, new cv.Point(-1, -1), 1, border);
                        let srcTemp = srcCopy.sub(srcOpen);
                        let srcEroded = srcCopy.erode(element, new cv.Point(-1, -1), 1, border);
                        skeleton = skeleton.bitwiseOr(srcTemp);
                        srcCopy = srcEroded.copy();

                        if (srcCopy.countNonZero() === 0) break;
                    }
                    
                    dst = skeleton;
                }
            }
            break;
        default: break;
    }

    const lastIndex = url.lastIndexOf('.');
    const imgType = url.slice(lastIndex+1);
    const imgWidth = src.rows;
    const imgHeight = src.cols;
    const newUrl = `${global.appPath}\\${uniqid()}.${imgType}`;
    const objIndex = windows_data.findIndex((obj => obj.id === id));

    cv.imwriteAsync(newUrl.split('\\').join('/'), dst)
    .then(() => {
        Jimp.read(newUrl, async (err, img) => {
            if (err) {
              console.log(err);
            } else {
                windows_data[objIndex].imgUrl = newUrl;
                windows_data[objIndex].imgData.data = [...img.bitmap.data];
                
                addHistogramWindow(true);
                BrowserWindow.fromId(id).webContents.send('url', {imgUrl: newUrl, imgHeight, imgWidth});
            }
        });
    }).catch(() => createErrorWindow());
});

ipcMain.on('add-twoimg-window', (_, funcName) => {
    let twoImgWindow = new BrowserWindow({
        width: 620,
        height: 420,
        autoHideMenuBar: true,
        resizable: false,
        title: funcName
    });

    twoImgWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer', 'twoImgWindow', 'twoImgWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    twoImgWindow.focus();
    
    twoImgWindow.webContents.on('did-finish-load', () => {
        twoImgWindow.webContents.send('funcName', funcName);
    });

    twoImgWindow.on('closed', () => {
        twoImgWindow = null;
    });

    // twoImgWindow.webContents.openDevTools()
});

ipcMain.on('get-new-last-focused-window', (_, winId) => {
    let url = '';

    windows_data.forEach(win => {
        if (win.id === lastFocusedWindow) url = win.imgUrl;
    });

    BrowserWindow.fromId(winId).webContents.send('new-last-focused-window', url);
});

ipcMain.on('add-histogram2d-window', (_, histogram2d) => {
    let histogram2dWindow = new BrowserWindow({
        width: 700,
        height: 750,
        autoHideMenuBar: true,
        title: 'Histogram 2D'
    });

    histogram2dWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer', 'histogram2dWindow', 'histogram2dWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    histogram2dWindow.focus();
    
    histogram2dWindow.webContents.on('did-finish-load', () => {
        histogram2dWindow.webContents.send('histogram2d', histogram2d);
    });

    histogram2dWindow.on('closed', () => {
        histogram2dWindow = null;
    });

    // histogram2dWindow.webContents.openDevTools()
});

function createErrorWindow() {
    let errorWindow = new BrowserWindow({
        width: 150,
        height: 120,
        autoHideMenuBar: true,
        resizable: false,
        //parent: mainWindow
    });

    errorWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer', 'errorWindow', 'errorWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    errorWindow.focus();

    errorWindow.on('closed', () => {
        errorWindow = null
    });

    setTimeout(() => {
        if (errorWindow) errorWindow.close();
    }, 2000);
}

app.whenReady().then(() => {
    createMainWindow();

    global.appPath = app.getPath('temp') + '\\' + uniqid('superSecretApp');
    fs.mkdirSync(global.appPath, { recursive: true });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
        rimraf.sync(global.appPath);
    }
});