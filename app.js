//http://restify.com/#jsonclient

'use strict'

const App =  process.env.NODE_ENV === 'production'
      ? require('./config/prod.conf')
      : require('./config/dev.conf');

const path = require('path')

// const InputPollerConf =  process.env.NODE_ENV === 'production'
//       ? require('./config/poller/prod.conf')
//       : require('./config/poller/dev.conf');
//
// const PollHttpConf =  process.env.NODE_ENV === 'production'
//       ? require('./config/poll/http/prod.conf')
//       : require('./config/poll/http/dev.conf');
//
//
// const InputPusherConf =  process.env.NODE_ENV === 'production'
//       ? require('./config/pusher/prod.conf')
//       : require('./config/pusher/dev.conf');
//
// const PushHttpConf =  process.env.NODE_ENV === 'production'
//       ? require('./config/push/http/prod.conf')
//       : require('./config/push/http/dev.conf');
//
//
// const OutputCradleConf =  process.env.NODE_ENV === 'production'
//       ? require('./config/output/cradle/prod.conf')
//       : require('./config/output/cradle/dev.conf');

const Pipeline = require('js-pipeline');

const debug = require('debug')('Server:App'),
    debug_internals = require('debug')('Server:App:Internals'),
    debug_events = require('debug')('Server:App:Events')

process.on('uncaughtException', (err) => {

		//debug('uncaughtException %o', err);
		console.log('uncaughtException', err);


		if(process.env.NODE_ENV !== 'production')
			process.exit(1);
})

//we register many 'exit' events on this emmiter to handle shutdown gracefully (ex: Poller), set it 0 to avoid Warning
process.setMaxListeners(0);

//const {NodeVM, VMScript} = require('vm2');

var Server = new Class({
  Extends: App,


  pollers: function(req, res, next){
		//console.log(req.params);
		var pollers = Object.clone(this.poll_app.pollers);

		//console.log('---GET CLIENTS---');
		//console.log(pollers);

		Object.each(this.poll_app.pollers, function(client, poll_id){
			//console.log(poll_id);
			//console.log(client);

			Array.each(client, function(scheme, index){
				if(index >= 0){
					if(this.poll_app.conn_pollers[poll_id] && this.poll_app.conn_pollers[poll_id][index]){
						pollers[poll_id][index].status = 'connected';
					}
					else if(this.poll_app.err_pollers[poll_id] && this.poll_app.err_pollers[poll_id][index]){
						pollers[poll_id][index].status = 'error';
					}
					else{
						pollers[poll_id][index].status = 'unknown';
					}
				}
			}.bind(this));
		}.bind(this));

		res.json(pollers);

		//res.status(204).send();

  },
  events: function(req, res, next){
		//console.log(req.params);

		////console.log(req.headers['user-agent']);
		////console.log(req.ip);
		//var client = {
			//agent: req.headers['user-agent'],
			//ip: req.ip
		//};

		if(req.params.event === null){//sent a wrong or not allow "event"
			res.status(409).json({status: 'That\'s is not an allowed event.'});//conflict
		}
		else if(req.params.event){
			var event_name = 'ON_'+req.params.event.toUpperCase();

			//if(this.poll_app[event_name]){
				//res.json({status: 'OK'});
				//this.poll_app.fireEvent(this.poll_app[event_name], req);

			//}
      let pipeline_index = (req.query && req.query.pipeline_index) ? req.query.pipeline_index : undefined
      let pipeline_id = (req.query && req.query.pipeline_id) ? req.query.pipeline_id : undefined
      pipeline_index = (pipeline_id) ? pipeline_id : undefined

      // debug_internals('PRE firing event on pipe..', req.query, pipeline_id, pipeline_index)

			Array.each(this.pipelines, function(pipe, index){

        if(pipeline_id && pipe.options.id && (pipeline_id == pipe.options.id))
          pipeline_index = index

        debug_internals('PRE firing event on pipe..', pipeline_id, pipeline_index)

				if(pipe[event_name] && (pipeline_index == index || !pipeline_index)){
          debug_internals('firing event on pipe..', pipe.options.id, index)
					pipe.fireEvent(pipe[event_name], req)
        }

			}.bind(this));

			res.json({event: event_name, pipeline_index: pipeline_index, status: 'OK'});
		}
		else{
			res.json({allowed: this.options.params.event.toString()});
		}
	},
  get: function(req, res, next){
		//console.log(req.params);

		// res.status(204).send();
    res.json({ id: this.options.id });
  },

  initialize: function(options){

		this.parent(options);//override default options

		this.profile('root_init');//start profiling

		if(this.options.pipelines)
			Array.each(this.options.pipelines, function(pipe, index){
				/**
				 * Merge general configs
				 * */
				// if(pipe['input']){
				// 	Array.each(pipe['input'], function(input){
				// 		let type = Object.keys(input)[0];
				// 		switch (type){
				// 			case 'poll':
				// 				input[type] = Object.merge(Object.clone(InputPollerConf), input[type]);
				// 				if(input[type]['conn'] && input[type]['conn']['scheme'] == 'http'){
				// 					Array.each(input[type]['conn'], function(conn, index){
				// 						input[type]['conn'][index] = Object.merge(Object.clone(PollHttpConf), conn);
				// 						////console.log(input[type]['conn'][index]);
				// 					});
				// 				}
				// 				break;
        //
				// 			case 'push':
				// 				input[type] = Object.merge(Object.clone(InputPusherConf), input[type]);
				// 				if(input[type]['conn'] && input[type]['conn']['scheme'] == 'http'){
				// 					Array.each(input[type]['conn'], function(conn, index){
				// 						input[type]['conn'][index] = Object.merge(Object.clone(PushHttpConf), conn);
				// 						////console.log(input[type]['conn'][index]);
				// 					});
				// 				}
				// 				break;
        //
				// 			default:
				// 				throw new Error('Input ['+type+'] not implemented');
				// 		}
				// 	});
        //
				// }
        //
				// if(pipe['output']){
				// 	Array.each(pipe['output'], function(output){
				// 		let type = Object.keys(output)[0];
				// 		switch (type){
				// 			case 'cradle':
				// 				output[type] = Object.merge(Object.clone(OutputCradleConf), output[type]);
				// 				//if(output[type]['conn']){
				// 					//Array.each(output[type]['conn'], function(conn, index){
				// 						//output[type]['conn'][index] = Object.merge(OutputCradleConf, conn);
				// 						//////console.log(input[type]['conn'][index]);
				// 					//});
				// 				//}
				// 				break;
        //
				// 			default:
				// 				//throw new Error('Output ['+type+'] not implemented');
				// 		}
				// 	});
				// }
        //
				// ////console.log(pipe['output'][0]['cradle']);
				// ////console.log(PollHttpConf);
				// //throw new Error();
				/**
				 * Merge general configs
				 * */

				debug('Adding pipeline %o', pipe);

				this.pipelines.push(new Pipeline(pipe));


			}.bind(this));

		this.profile('root_init');//end profiling
		this.log('root', 'info', 'root started');
  },


});

let optionator = require('optionator')({
    prepend: 'Usage: cmd [options]',
    append: 'Version: '+process.env.npm_package_version,
    options: [{
        option: 'help',
        alias: 'h',
        type: 'Boolean',
        description: 'displays help'
    }, {
        option: 'pipelines',
        alias: 'P',
        type: 'String',
        description: 'Pipelines file',
        example: 'cmd --pipelines etc/pipelines.js'
    }]
})

let options = optionator.parseArgv(process.argv);
if (options.help) {
  console.log(optionator.generateHelp())
  process.exit(0)
}
if(options.pipelines){
  options.pipelines = require(path.join(process.cwd(), options.pipelines))
}

let server = new Server(options);

//root.load(path.join(__dirname, '/apps'));

module.exports = server.express();

/**
* https://stackoverflow.com/questions/25976783/how-to-restart-my-node-js-app-when-the-cpu-usage-reach-100-on-amazon-ec2-and-th
**/

// const usage = require('usage')
// const CHECK_CPU_USAGE_INTERVAL    = 1000 * 10; // every 10 sec
// const HIGH_CPU_USAGE_LIMIT        = 200; // percentage
//
// let autoRestart = setInterval(function()
// {
//     usage.lookup(process.pid, function(err, result)
//     {
//       debug_internals('lookup', err, result, process.pid);
//         if(!err)
//         {
//             if(result.cpu > HIGH_CPU_USAGE_LIMIT)
//             {
//                 // log
//                 debug_internals('restart due to high cpu usage');
//
//                 // restart because forever/pm2 will respawn your process
//                 process.exit(-1);
//             }
//         }
//     });
// }, CHECK_CPU_USAGE_INTERVAL);
