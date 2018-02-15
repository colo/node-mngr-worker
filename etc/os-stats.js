module.exports = {
 input: [
	{
		poll: {
			id: "remote.cradle",
			conn: [{scheme: 'cradle', host:'192.168.0.180', port: 5984 , db: 'dashboard'}],
			requests: {
				periodical: 60000,
			},
		},
	}
 ],
 filters: [
		require('./snippets/filter.statistics.template'),
		require('./snippets/filter.sanitize.template'),
	],
	output: [
		//require('./snippets/output.stdout.template'),
		{
			cradle: {
				id: "remote.cradle",
				conn: [
					{
						host: '192.168.0.180',
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
