'use stric'

const path = require('path');

var cron = require('node-cron');

module.exports = {
 input: [
	{
		poll: {
			id: "input.os.stats.cradle",
			conn: [
				{
					scheme: 'cradle',
					host:'elk',
					port: 5984 ,
					db: 'dashboard',
					module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/cradle')),
					load: ['apps/os/historical/minute/']
				}
			],
			requests: {
				/**
				 * runnign at 20 secs intervals
				 * needs 3 runs to start analyzing from last stats (or from begining)
				 * it takes 60 secs to complete, so it makes stats each minute
				 * @use node-cron to start on 0,20,40....or it would start messuring on a random timestamp
				 * */
				periodical: function(dispatch){
					return cron.schedule('19,39,59 * * * * *', dispatch);//every 20 secs
				}
				//periodical: 20000,
				//periodical: 2000,//test
			},

		},
	}
 ],
 filters: [
		require('./snippets/filter.os.historical.minute.template'),
		require('./snippets/filter.sanitize.template'),
	],
	output: [
		//require('./snippets/output.stdout.template'),
		{
			cradle: {
				id: "output.os.stats.cradle",
				conn: [
					{
						host: 'elk',
						port: 5984,
						db: 'dashboard',
						opts: {
							cache: true,
							raw: false,
							forceSave: true,
						}
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