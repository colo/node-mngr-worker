'use strict'

var cron = require('node-cron');

module.exports = {
	poll: {
		id: "localhost.http",
		conn: [
			{
				scheme: 'http',
				host:'127.0.0.1',
				port: 8081,
			}
		],
		requests: {
			periodical: function(dispatch){
				return cron.schedule('* * * * *', dispatch);//every minute
			}
		},
	},
}
