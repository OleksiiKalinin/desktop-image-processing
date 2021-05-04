function posterize(bitmap, count) {
	const step = Math.round(255 / count);

    let bins = [0];
    for(let i = 1; i < count; ++i) bins.push(step*i);

    for(let i = 0; i < bitmap.length; ++i) {
        if ((i + 1) % 4 !== 0) {
            let temp = bitmap[i];
            for(let j = 0; j < bins.length - 1; ++j) {
                if (temp > bins[j]) bitmap[i] = bins[j];
            }
            if (bitmap[i] > bins[bins.length-1]) bitmap[i] = 255;
        }
    }
    
    return bitmap;
}

module.exports = posterize;