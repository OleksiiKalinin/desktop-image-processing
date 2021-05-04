function progowanie(bitmap, prog) {
	for(let i = 0; i < bitmap.length; ++i) {
        if ((i + 1) % 4 !== 0) {
            if (bitmap[i] <= prog) {
                bitmap[i] = 0;
            } else {
                bitmap[i] = 255;
            }
        }
    }
    
    return bitmap;
}

module.exports = progowanie;