function histogram2d(img1Data, img2Data) {
    const rows = img1Data.length, cols = img1Data[0].length;
    let hist2d = [...Array(256)].map(() => Array(256).fill(0));

    for(let i = 0; i < rows; ++i) {
        for(let j = 0; j < cols; ++j) {
            let dataBefore = img1Data[i][j];
            let dataAfter = img2Data[i][j];

            hist2d[dataBefore][dataAfter]++;
        }
    }
    
	return hist2d;
}

module.exports = histogram2d;