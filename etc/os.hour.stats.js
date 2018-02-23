module.exports = {
 input: [
	{
		poll: {
			id: "input.os.stats.cradle",
			conn: [
				{
					scheme: 'cradle',
					host:'192.168.0.180',
					//host:'127.0.0.1',
					port: 5984 ,
					db: 'stats',
					load: ['apps/os/stats/hour/']
				}
			],
			requests: {
				/**
				 * runnign at 20 min intervals
				 * needs 3 runs to start analyzing from last stats (or from begining)
				 * it takes 60 min to complete, so it makes stats each hour
				 * */
				//periodical: 1200000,
				periodical: 2000,//test
			},
		},
	}
 ],
 filters: [
		require('./snippets/filter.os.hour.statistics.template'),
		require('./snippets/filter.sanitize.template'),
	],
	output: [
		//require('./snippets/output.stdout.template'),
		{
			cradle: {
				id: "output.os.stats.cradle",
				conn: [
					{
						//host: '127.0.0.1',
						host: '192.168.0.180',
						port: 5984,
						db: 'stats',
						opts: {
							cache: true,
							raw: false,
							forceSave: true,
						}
					},
				],
				buffer:{
					size: 0,
					expire:0
				}
			}
		}
	]
}
