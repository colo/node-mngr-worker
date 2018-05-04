'use stric'

const path = require('path');

module.exports = {
 input: [
	{
		poll: {
			id: "input.os.http",
			conn: [
				{
					scheme: 'http',
					host:'127.0.0.1',
					port: 8081,
					module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/http')),
					load: ['apps/info/os/']
				}
			],
			requests: {
				periodical: 1000,
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
						// host: '192.168.0.180',
						port: 5984,
						db: 'dashboard',
						opts: {
							cache: true,
							raw: false,
							forceSave: true,
						},
					},
				],
				module: require(path.join(process.cwd(), 'lib/pipeline/output/cradle')),
        buffer:{
					size: 0,
					expire:0
				}
			}
		}
	]
}
