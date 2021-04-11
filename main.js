const path = require('path');
const url = require('url');
const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');
const Jimp = require('jimp');
// require('electron-reload')(__dirname);

let mainWindow, imageWindow, histogramWindow, histogramAsListWindow, plotProfileWindow, lastFocusedWindow, lastFocusedWindows = [],
    windows_data = [],
    whoOpenedHistogram = [],
    histogramAsList, whoOpenedHistogramAsList = [],
    plotProfileData = [],
    whoOpenedPlotProfile = [];


const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 300,
        autoHideMenuBar: true
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer', 'index', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // mainWindow.webContents.openDevTools()

    mainWindow.on('closed', () => mainWindow = null);
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
            parent: mainWindow,
            title: `${imgName}: ${imgData.width}x${imgData.height}; ${imgType ? 'RGB' : '8-bit'}; ${(imgSize / 1024).toFixed(1)} KB`
        });

        imageWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'renderer', 'imgWindow', 'imgWindow.html'),
            protocol: 'file:',
            slashes: true
        }));

        const winId = imageWindow.id;

        imageWindow.on('closed', () => {
            imageWindow = null;
            let index = lastFocusedWindows.lastIndexOf(winId);
            lastFocusedWindows = [
                ...lastFocusedWindows.slice(0, index),
                ...lastFocusedWindows.slice(index + 1)
            ];
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
            histogramWindow = new BrowserWindow({
                width: 400,
                height: 310,
                autoHideMenuBar: true,
                // resizable: false,
                parent: mainWindow,
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
        let errorWindow = new BrowserWindow({
            width: 150,
            height: 120,
            autoHideMenuBar: true,
            resizable: false,
            parent: mainWindow
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
});

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
            parent: mainWindow,
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
                parent: mainWindow,
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
        let errorWindow = new BrowserWindow({
            width: 150,
            height: 120,
            autoHideMenuBar: true,
            resizable: false,
            parent: mainWindow
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

app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})