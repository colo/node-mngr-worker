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
			periodical: 1000,
		},
	},
};
