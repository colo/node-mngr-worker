module.exports = {
 input: [
	{
		poll: {
			id: "input.os.stats.cradle",
			conn: [
				{
					scheme: 'cradle',
					//host:'192.168.0.180',
					host:'127.0.0.1',
					port: 5984 ,
					db: 'dashboard'}
			],
			requests: {
				periodical: 1000,
			},
		},
	}
 ],
 filters: [
		require('./snippets/filter.os.statistics.template'),
		require('./snippets/filter.sanitize.template'),
	],
	output: [
		//require('./snippets/output.stdout.template'),
		{
			cradle: {
				id: "output.os.stats.cradle",
				conn: [
					{
						host: '127.0.0.1',
						//host: '192.168.0.180',
						port: 5984,
						db: 'stats',
						opts: {
							cache: true,
							raw: false,
							forceSave: true,
						}
					},
				]
			}
		}
	]
}
