module.exports = {
 input: [
	{
		poll: {
			id: "input.os.http",
			conn: [
				{
					scheme: 'http',
					//host:'192.168.0.180',
					host:'127.0.0.1',
					port: 8081
				}
			],
			requests: {
				periodical: 3000,
			},
		},
	}
 ],
 filters: [
		require('./snippets/filter.sanitize.template'),
	],
	output: [
		//require('./snippets/output.stdout.template'),
		{
			cradle: {
				id: "output.os.cradle",
				conn: [
					{
						host: '127.0.0.1',
						//host: '192.168.0.180',
						port: 5984,
						db: 'dashboard',
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
