module.exports = {
	poll: {
		id: "remote.imap",
		conn: [
			require('../devel/imap.infraestructura')
		],
		connect_retry_count: 5,
		connect_retry_periodical: 5000,
		requests: {
			periodical: 2000,
		},
	},
};

