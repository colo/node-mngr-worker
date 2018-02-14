module.exports = {
	poll: {
		id: "remote.munin",
		conn: [
			{
				scheme: 'munin',
				host:'127.0.0.1',
				port: 4949,
			}
		],
		connect_retry_count: 5,
		connect_retry_periodical: 5000,
		requests: {
			periodical: 2000,
		},
	}
};
