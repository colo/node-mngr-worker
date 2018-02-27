module.exports = {
 input: [
	{
		poll: {
			id: "input.os.purge.cradle",
			conn: [
				{
					scheme: 'cradle',
					host:'192.168.0.180',
					//host:'127.0.0.1',
					port: 5984 ,
					db: 'dashboard',
					load: ['apps/os/purge/historical/'],
				}
			],
			requests: {
				/**
				 * runnign at 20 secs intervals
				 * needs 3 runs to start analyzing from last stats (or from begining)
				 * it takes 60 secs to complete, so it makes stats each minute
				 * */
				periodical: 20000,
			},
		},
	}
 ],
 //filters: [
		//require('./snippets/filter.os.statistics.template'),
		//require('./snippets/filter.sanitize.template'),
	//],
	/**output: [
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
					size: 100,
					expire: 1000
				}
			}
		}
	]
	**/
}
