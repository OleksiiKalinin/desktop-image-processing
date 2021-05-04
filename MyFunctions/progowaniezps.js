function progowaniezps(bitmap, p1, p2) {
	for(let i = 0; i < bitmap.length; ++i) {
        if ((i + 1) % 4 !== 0) {
            if (bitmap[i] >= p1 && bitmap[i] <= p2) {
                bitmap[i] = bitmap[i];
            } else {
                bitmap[i] = 0;
            }
        }
    }
    
    return bitmap;
}

module.exports = progowaniezps;