'use strict'

const path = require('path');

module.exports = {
 input: [
	{
        poll: {
                id: "local.munin",
                conn: [
                        {
                                scheme: 'munin',
                                host:'192.168.0.40',
                                port: 4949,
                                module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/munin')),
                                load: ['apps/munin/'],
                        }
                ],
                connect_retry_count: 5,
                connect_retry_periodical: 5000,
                requests: {
                        periodical: 1000,
                },
        }

        }
 
 ],
 filters: [
	require('../snippets/filter.sanitize.template'),
 ],
 output: [
	require('../snippets/output.stdout.template'),
 ]
}
