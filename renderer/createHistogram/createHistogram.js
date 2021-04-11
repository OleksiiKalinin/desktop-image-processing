exports.colorChannels =
{
    Red: 0,
    Green: 1,
    Blue: 2,
	Gray: 3
};

exports.histogram = (channel, bitmap) => {
	if (channel === exports.colorChannels.Gray) {
		const allFrequencies = [
			getColourFrequencies(exports.colorChannels.Red, bitmap),
			getColourFrequencies(exports.colorChannels.Green, bitmap),
			getColourFrequencies(exports.colorChannels.Blue, bitmap)
		];

		const maxFrequency = Math.max(...allFrequencies.map(obj => obj.maxFrequency));
		const colourFrequencies = allFrequencies.map(fr => fr.colourFrequencies);
		
		return createHistogram(channel, colourFrequencies, maxFrequency);
	} 

	const {colourFrequencies, maxFrequency} = getColourFrequencies(channel, bitmap);

	return createHistogram(channel, colourFrequencies, maxFrequency);
}

function getColourFrequencies(channel, bitmap)
{
	const startIndex = (channel === 3) ? 0 : channel; 

	let maxFrequency = 0;
	const colourFrequencies = Array(256).fill(0);

	for(let i = startIndex; i < bitmap.data.length; i+= 4)
	{
		colourFrequencies[bitmap.data[i]]++;

		if(colourFrequencies[bitmap.data[i]] > maxFrequency)
		{
			maxFrequency++;
		}
	}

	return {colourFrequencies, maxFrequency};
}


function createHistogram(channel, allColourFrequencies, maxFrequency) {
	const histWidth = 512;
	const histHeight = 316;
	const colorPannelHeight = 10;
	const columnWidth = 2;
	const pixelsPerUnit = (histHeight - colorPannelHeight) / maxFrequency;
	let colourFrequencies = [];
	
	if (channel === exports.colorChannels.Gray) {
		for (let i = 0; i <= 255; i++) {
			colourFrequencies.push(Math.max(allColourFrequencies[0][i], allColourFrequencies[1][i], allColourFrequencies[2][i]));
		}
	} else {
		colourFrequencies = allColourFrequencies;
	}

	let svgstring = `<svg width='100%' height='100%' viewBox="0 0 ${histWidth} ${histHeight}" xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink'>\n`;

	for (let i = 0, x = 0; i <= 255; i++) {
		let hexColour = i.toString(16).padStart(2, "0");

		switch (channel) {
			case exports.colorChannels.Red:
				hexColour = "#" + hexColour + "0000";
				break;
			case exports.colorChannels.Green:
				hexColour = "#00" + hexColour + "00";
				break;
			case exports.colorChannels.Blue:
				hexColour = "#0000" + hexColour;
				break;
			case exports.colorChannels.Gray:
				hexColour = '#' + hexColour + hexColour + hexColour;
				break;
			default: break;
		}
		
		const columnHeight = colourFrequencies[i] * pixelsPerUnit;

		svgstring += `
			<rect fill='#000000' stroke='#000000' stroke-width='0.25px' width='${columnWidth}' height='${columnHeight}' y='${histHeight - columnHeight - colorPannelHeight}' x='${x}' />\n
			<rect fill='${hexColour}' stroke='${hexColour}' stroke-width='0.25px' width='${columnWidth}' height='${colorPannelHeight}' y='${histHeight - colorPannelHeight + 2}' x='${x}' />\n
		`;

    	x += columnWidth;
    }

	svgstring += "</svg>";

	return {svgstring, colourFrequencies};
}
