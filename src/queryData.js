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

function queryData(args, serviceUrl) {
	return new Promise((resolve, reject) => {
		const flymine = new imjs.Service({ root: serviceUrl });
		flymine
			.records(makeQuery(args))
			.then(resolve)
			.catch(reject);
	});
}

module.exports = queryData;
