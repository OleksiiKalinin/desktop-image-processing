function equalize(colourFrequencies) {
	let lut = [], distribuant = [colourFrequencies[0]];

    for (let i = 1; i < colourFrequencies.length; ++i) {
        distribuant.push(distribuant[distribuant.length - 1] + colourFrequencies[i]);
    }

    dist_min = Math.min(...distribuant);
    dist_max = Math.max(...distribuant);

    for(let i of distribuant) {
        lut.push(Math.abs(((i - dist_min) * 255) / (dist_max - dist_min)));
    }
    
    return lut;
}

module.exports = equalize;