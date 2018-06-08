'use stric'

const path = require('path');

var cron = require('node-cron');

let output = [
  function(doc){
    console.log('os alerts output',doc.metadata, JSON.decode(doc))
  },
  //require('./snippets/output.stdout.template'),
  // {
  // 	cradle: {
  // 		id: "output.os.alerts.cradle",
  // 		conn: [
  // 			{
  // 				//host: '127.0.0.1',
  // 				host: 'elk',
  // 				port: 5984,
  // 				db: 'dashboard',
  // 				opts: {
  // 					cache: true,
  // 					raw: false,
  // 					forceSave: true,
  // 				}
  // 			},
  // 		],
  // 		module: require(path.join(process.cwd(), 'lib/pipeline/output/cradle')),
  // 		buffer:{
  // 			size: 0,
  // 			expire:0
  // 		}
  // 	}
  // }
]

module.exports = {
 input: [
	{
		poll: {
			id: "input.os.alerts.cradle",
			conn: [
				{
					scheme: 'cradle',
					host:'elk',
					//host:'127.0.0.1',
					port: 5984 ,
					db: 'dashboard',
					module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/cradle')),
					load: ['apps/os/alerts/current']
				}
			],
			requests: {
				/**
				 * runnign at 20 secs intervals
				 * needs 3 runs to start analyzing from last historical (or from begining)
				 * it takes 60 secs to complete, so it makes historical each minute
				 * @use node-cron to start on 0,20,40....or it would start messuring on a random timestamp
				 * */
				// periodical: function(dispatch){
				// 	return cron.schedule('19,39,59 * * * * *', dispatch);//every 20 secs
				// }
				periodical: 1000,
				//periodical: 2000,//test
			},

		},
	},
  {
   poll: {
     id: "input.os.alerts.minute.cradle",
     conn: [
       {
         scheme: 'cradle',
         host:'elk',
         //host:'127.0.0.1',
         port: 5984 ,
         db: 'dashboard',
         module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/cradle')),
         load: ['apps/os/alerts/minute']
       }
     ],
     requests: {
       /**
        * runnign at 20 secs intervals
        * needs 3 runs to start analyzing from last historical (or from begining)
        * it takes 60 secs to complete, so it makes historical each minute
        * @use node-cron to start on 0,20,40....or it would start messuring on a random timestamp
        * */
       // periodical: function(dispatch){
       // 	return cron.schedule('19,39,59 * * * * *', dispatch);//every 20 secs
       // }
       // periodical: 20000,
       //periodical: 2000,//test
     },

   },
  },
 ],
 filters: [
		// require('./snippets/filter.os.historical.minute.template'),
		function(doc, opts, next){
      // console.log('os alerts filter', doc, opts, next)

      if(doc[0].doc.metadata.path != 'os.historical'){

        process_os_doc(doc, opts)

      }
      else{
        process_historical_minute_doc(doc, opts)
      }


      // if(opts.type == 'once' &&  Object.getLength(doc) == 0)//empty os.alerts, create default ones
      //   next(
      //     {
      //       data: {},
      //       // metadata: {
      //       //   path: 'os.alerts',
      //       //   timestamp: Date.now()
      //       // }
      //     },
      //     opts,
      //     next
      //   )

    },
    process_os_doc = function(doc, opts, next){
      console.log('process_os_doc alerts filter', doc, output)
      sanitize(doc[0], opts, output[0])
      // output[0](doc)
    },
    process_historical_minute_doc = function(doc, opts, next){
      console.log('process_historical_minute_doc alerts filter', doc)
    },
    sanitize = require('./snippets/filter.sanitize.template'),
	],
	output: output
}
