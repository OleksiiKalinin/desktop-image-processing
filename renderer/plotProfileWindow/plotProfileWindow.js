const {ipcRenderer} = require('electron');
const wrapper = document.querySelector('div');

ipcRenderer.send('plot_profile_window_loaded', '');

ipcRenderer.on('plot_data', (_, data) => {
    if (data) {
		plotWidth = window.getComputedStyle(wrapper.children[0]).width.replace(/\D/g, '');
        wrapper.children[0].innerHTML = createPlot(data, Math.max(...data), plotWidth);
    }
});

function createPlot(colourFrequencies, maxFrequency, plotWidth = 500) {
	const frequenciesCount = colourFrequencies.length;
	const plotHeight = 256;
	const pointsDistance = (plotWidth - 38 - 20) / frequenciesCount;
	const pixelsPerUnit = (plotHeight - 5) / (maxFrequency ? maxFrequency : 0.000000000001);
	let axisX = [], axisY = [];

	let svgstring = `
		<g class="grid x-grid" id="xGrid">
			<line x1="38" x2="38" y1="5" y2="261"></line>
		</g>
		<g class="grid x-grid" id="xGrid">
			<line x1="${(plotWidth - 20)/4}" x2="${(plotWidth - 20)/4}" y1="5" y2="265"></line>
		</g>
		<g class="grid x-grid" id="xGrid">
			<line x1="${(plotWidth - 20)/2}" x2="${(plotWidth - 20)/2}" y1="5" y2="265"></line>
		</g>
		<g class="grid x-grid" id="xGrid">
			<line x1="${(plotWidth - 20)/2 + (plotWidth - 20)/4}" x2="${(plotWidth - 20)/2 + (plotWidth - 20)/4}" y1="5" y2="265"></line>
		</g>
		<g class="grid x-grid" id="xGrid">
			<line x1="${(plotWidth - 20)}" x2="${(plotWidth - 20)}" y1="5" y2="265"></line>
		</g>
		<g class="grid y-grid" id="yGrid">
			<line x1="38" x2="${plotWidth - 20}" y1="261" y2="261"></line>
		</g>
		<g class="grid y-grid" id="yGrid">
			<line x1="33" x2="${plotWidth - 20}" y1="197" y2="197"></line>
		</g>
		<g class="grid y-grid" id="yGrid">
			<line x1="33" x2="${plotWidth - 20}" y1="133" y2="133"></line>
		</g>
		<g class="grid y-grid" id="yGrid">
			<line x1="33" x2="${plotWidth - 20}" y1="69" y2="69"></line>
		</g>
		<g class="grid y-grid" id="yGrid">
			<line x1="33" x2="${plotWidth - 20}" y1="5" y2="5"></line>
		</g>
		<g class="labels x-labels">
			<text x="${(plotWidth - 20)/4}" y="275">${Math.round(frequenciesCount/4)}</text>
			<text x="${(plotWidth - 20)/2}" y="275">${Math.round(frequenciesCount/2)}</text>
			<text x="${(plotWidth - 20)/2 + (plotWidth - 20)/4}" y="275">${Math.round(frequenciesCount/2) + Math.round(frequenciesCount/4)}</text>
			<text x="${plotWidth - 20}" y="275">${frequenciesCount}</text>
			<text x="${(plotWidth - 20)/2}" y="290" class="label-title">Distance(pixels)</text>
		</g>
		<g class="labels y-labels">
			<text x="35" y="10">${maxFrequency}</text>
			<text x="35" y="74">${Math.round(maxFrequency/2) + Math.round(maxFrequency/4)}</text>
			<text x="35" y="137">${Math.round(maxFrequency/2)}</text>
			<text x="35" y="200">${Math.round(maxFrequency/4)}</text>
			<text x="34" y="270">0</text>
			<text class="y-labels label-title">Gray value</text>
		</g>
	`;

	for (let i = 0, x = 38; i < colourFrequencies.length; i++) {
		
		const columnHeight = colourFrequencies[i] * pixelsPerUnit;

		axisY.push(plotHeight - columnHeight);
		axisX.push(x);

    	x += pointsDistance;
    }

	let points = '';

	for (let i = 0; i < axisY.length; i++) {
		points += `${axisX[i]},${axisY[i]} `;
	}

	svgstring += `<polyline points="${points}" style="fill:none;stroke:black;stroke-width:1" />`;

	return svgstring;
}