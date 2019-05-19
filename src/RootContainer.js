import React from 'react';
import Plotly from 'plotly.js/lib/core';
import queryData from './queryData';

Plotly.register([require('plotly.js/lib/bar')]);

const getHoverText = (affCall, signal, enrichment) => {
	let regulationText = 'Same as Whole Fly';
	if (affCall === 'Up') regulationText = 'Up Regulated';
	else if (affCall === 'Down') regulationText = 'Down Regulated';
	return `${regulationText}: (<b>signal: ${signal}, enrichment: ${enrichment}</b>)`;
};

const getColor = affyCall => {
	if (!affyCall || affyCall === 'None') return '#7E3CB5';
	else if (affyCall == 'Up') return '#AD3E61';
	return '#344DB5';
};

class RootContainer extends React.Component {
	componentDidMount() {
		const { entity, serviceUrl } = this.props;
		queryData(
			{
				orgName: entity.orgName,
				geneId: entity.value
			},
			serviceUrl
		).then(records => {
			const results = records[0].microArrayResults;
			results.sort((r1, r2) => {
				const textA = r1.tissue.name.toUpperCase();
				const textB = r2.tissue.name.toUpperCase();
				return textA < textB ? 1 : textA > textB ? -1 : 0;
			});

			const chartData = {
				enrichments: [],
				tissueNames: [],
				colors: [],
				hoverTexts: []
			};
			results.forEach(result => {
				chartData.enrichments.push(Math.log2(Number(result.enrichment)));
				chartData.tissueNames.push(result.tissue.name);
				chartData.colors.push(getColor(result.affyCall));
				chartData.hoverTexts.push(
					getHoverText(result.affCall, result.mRNASignal, result.enrichment)
				);
			});

			Plotly.newPlot(
				document.getElementById('firstGraph'),
				[
					{
						x: chartData.enrichments,
						y: chartData.tissueNames,
						type: 'bar',
						orientation: 'h',
						marker: {
							color: chartData.colors
						},
						hoverinfo: 'x+text',
						text: chartData.hoverTexts,
						hoverlabel: {
							bgcolor: '#FFFFFF',
							bordercolor: '#000000'
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
				},
				{
					displayModeBar: false
				}
			);
		});
	}

	render() {
		return (
			<>
				<div id="firstGraph" />
				<div id="selectBoxes" />
			</>
		);
	}
}

export default RootContainer;
