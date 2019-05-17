const Plotly = require('plotly.js/lib/core');

Plotly.register([require('plotly.js/lib/bar')]);

const makeQuery = args => ({
	from: 'Gene',
	select: [
		'secondaryIdentifier',
		'symbol',
		'microArrayResults.mRNASignal',
		'microArrayResults.mRNASignalSEM',
		'microArrayResults.presentCall',
		'microArrayResults.enrichment',
		'microArrayResults.affyCall',
		'microArrayResults.dataSets.name',
		'microArrayResults.tissue.name'
	],
	orderBy: [
		{
			path: 'secondaryIdentifier',
			direction: 'ASC'
		}
	],
	where: [
		{
			path: 'microArrayResults',
			type: 'FlyAtlasResult'
		},
		{
			path: 'organism.name',
			op: '=',
			value: args.orgName
		},
		{
			path: 'Gene',
			op: 'LOOKUP',
			value: args.geneId
		}
	]
});

const getColor = affyCall => {
	if (!affyCall || affyCall === 'None') return '#7E3CB5';
	else if (affyCall == 'Up') return '#AD3E61';
	return '#344DB5';
};

// make sure to export main, with the signature
function main(el, service, imEntity, state, config) {
	if (!el || !service || !imEntity || !state || !config) {
		throw new Error('Call main with correct signature');
	}

	const flymine = new imjs.Service({ root: service.root });
	const query = makeQuery({
		orgName: imEntity.orgName,
		geneId: imEntity.value
	});

	flymine.records(query).then(function(records) {
		const results = records[0].microArrayResults;
		results.sort((r1, r2) => {
			const textA = r1.tissue.name.toUpperCase();
			const textB = r2.tissue.name.toUpperCase();
			return textA < textB ? 1 : textA > textB ? -1 : 0;
		});

		const chartData = {
			enrichments: [],
			tissueNames: [],
			colors: []
		};
		results.forEach(result => {
			chartData.enrichments.push(Math.log2(Number(result.enrichment)));
			chartData.tissueNames.push(result.tissue.name);
			chartData.colors.push(getColor(result.affyCall));
		});

		Plotly.newPlot(
			el,
			[
				{
					x: chartData.enrichments,
					y: chartData.tissueNames,
					type: 'bar',
					orientation: 'h',
					ygap: 1,
					marker: {
						color: chartData.colors
					}
				}
			],
			{
				font: { size: 12 },
				yaxis: {
					title: {
						text: '<b><i>Tissue Name</i></b>',
						font: {
							family: 'monospace',
							size: 14,
							color: '#7f7f7f'
						}
					},
					automargin: true
				},
				xaxis: {
					title: {
						text: '<b><i>Enrichment (log<sup>2</sup>)</i></b>',
						font: {
							family: 'monospace',
							size: 14,
							color: '#7f7f7f'
						}
					},
					showgrid: true,
					automargin: true
				}
			}
		);

		// console.log('No. of rows: ' + rows.length);
		// rows.forEach(function printRow(row) {
		// 	console.log(row);
		// });
	});
}

module.exports = { main };
