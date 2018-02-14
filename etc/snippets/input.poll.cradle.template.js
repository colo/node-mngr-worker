module.exports = {
	poll: {
		id: "localhost.cradle",
		conn: [{scheme: 'cradle', host:'127.0.0.1', port: 5984 , db: 'dashboard'}],
		requests: {
			periodical: 1000,
		},
	},
};
