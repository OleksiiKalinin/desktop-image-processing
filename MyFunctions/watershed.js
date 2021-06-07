const cv = require('opencv4nodejs');

function watershed(url) {
    let image = cv.imread(url.split('\\').join('/'));
    let imageGray = image.cvtColor(cv.COLOR_RGB2GRAY);
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
	const thresh = imageGray.threshold(0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU).erode(kernel);
    const opening = thresh.dilate(kernel);
    const sureBg = opening.dilate(kernel, new cv.Point(-1, -1), 3);
    const distTransform = opening.distanceTransform(cv.DIST_L2, 5).normalize(1, 0, cv.NORM_INF);
    const sureFg = distTransform.threshold(0.7 * 1, 255, cv.THRESH_BINARY).convertTo(cv.CV_8U);
    const unknown = sureBg.sub(sureFg);
    let markers = sureFg.connectedComponents();

    let markersData = markers.getDataAsArray();
    const unknownData = unknown.getDataAsArray();
    for (let i = 0; i < markers.rows; i++) {
        for (let j = 0; j < markers.cols; j++) {
            markers.set(i, j, markersData[i][j]+1);
            if (unknownData[i][j] == 255) {
                markers.set(i, j, 0);
            }
        }
    }
    
    let markers2 = image.watershed(markers);
    image = image.cvtColor(cv.COLOR_RGBA2RGB, 0);
    markers2Data = markers2.getDataAsArray();
    
    for (let i = 0; i < markers2.rows; i++) {
        for (let j = 0; j < markers2.cols; j++) {
            if (markers2Data[i][j] == -1) {
                image.set(i, j, [0, 0, 255]);
            }
        }
    }

    return image;
}

module.exports = watershed;