module.exports = {
	poll: {
		id: "remote.munin",
		conn: [
			{
				scheme: 'munin',
				host:'xxx.xxx.xxx.xxx',
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
