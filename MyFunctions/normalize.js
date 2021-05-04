function normalize(bitmap, Lmax) {
	const withoutAlfa = bitmap.filter((_, i) => (i + 1) % 4 !== 0);

    let min = withoutAlfa[0], max = withoutAlfa[0];

    for(let i of withoutAlfa) {
        if (i < min) min = i;
        if (i > max) max = i;
    }
    
    for (let i = 0; i < bitmap.length; i++) {
        if ((i + 1) % 4 !== 0) {
            bitmap[i] = Math.round(((bitmap[i] - min) * Lmax) / (max - min));
        }
    }
    
    return bitmap;
}

module.exports = normalize;