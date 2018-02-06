//http://restify.com/#jsonclient

'use strict'

const App =  process.env.NODE_ENV === 'production'
      ? require('./config/prod.conf')
      : require('./config/dev.conf');

const InputPollerConf =  process.env.NODE_ENV === 'production'
      ? require('./config/poller/prod.conf')
      : require('./config/poller/dev.conf');

const PollHttpConf =  process.env.NODE_ENV === 'production'
      ? require('./config/poll/http/prod.conf')
      : require('./config/poll/http/dev.conf');

const OutputCradleConf =  process.env.NODE_ENV === 'production'
      ? require('./config/output/cradle/prod.conf')
      : require('./config/output/cradle/dev.conf');

const Pipeline = require('./lib/pipeline');

var debug = require('debug')('Server:App');

process.on('uncaughtException', (err) => {
		
		//debug('uncaughtException %o', err);
		console.log('uncaughtException', err);
		
		
		if(process.env.NODE_ENV !== 'production')
			process.exit(1);
})

                  
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
			
			Array.each(this.pipelines, function(pipe, index){
				if(pipe[event_name])
					pipe.fireEvent(pipe[event_name], req);
			}.bind(this));
			
			res.json({status: 'OK'});
		}
		else{
			res.json({allowed: this.options.params.event.toString()});
		}
	},
  get: function(req, res, next){
		//console.log(req.params);
		
		res.status(204).send();
		
  },
  
  initialize: function(options){
		
		this.parent(options);//override default options
		
		this.profile('root_init');//start profiling
		
		if(this.options.pipelines)
			Array.each(this.options.pipelines, function(pipe, index){
				//const pipe_vm = new NodeVM({
					//sandbox: {
						//Pipeline: Pipeline,
						//pipe: pipe
					//},
					////nesting: true,
					////require: true,
					//require: {
							//external: true,
							//builtin: '*',
							////root: "./",
							////import: [Pipeline]
					//}
				//});
				
				////var pipe_script = null;
				//////pipe_script.compile();
				
				////try {
					////pipe_script = new VMScript("new Pipeline(pipe)").compile();
					//////console.log(pipe_script);
				////}
				////catch (err) {
						//////console.error('Failed to compile script.', err);
				////}
				
				//try {
					//let running_pipe = pipe_vm.run("module.exports = new Pipeline(pipe)");
					////let functionInSandbox = pipe_vm.run("module.exports = new Pipeline(pipe)");
					////try{
						////functionInSandbox();
					////}
					////catch (e){}
					////let running_pipe = pipe_vm.run(pipe_script);
					//this.pipelines.push(running_pipe);
				//}
				//catch (err) {
					////console.error('Failed to execute script.', err);
				//}
				
				
				/**
				 * Merge general configs
				 * */
				if(pipe['input']){
					Array.each(pipe['input'], function(input){
						let type = Object.keys(input)[0];
						switch (type){
							case 'poller':
								input[type] = Object.merge(InputPollerConf, input[type]);
								if(input[type]['conn']){
									Array.each(input[type]['conn'], function(conn, index){
										input[type]['conn'][index] = Object.merge(PollHttpConf, conn);
										////console.log(input[type]['conn'][index]);
									});
								}
								break;
								
							default:
								throw new Error('Input ['+type+'] not implemented');
						}
					});
					
				}
				
				if(pipe['output']){
					Array.each(pipe['output'], function(output){
						let type = Object.keys(output)[0];
						switch (type){
							case 'cradle':
								output[type] = Object.merge(OutputCradleConf, output[type]);
								//if(output[type]['conn']){
									//Array.each(output[type]['conn'], function(conn, index){
										//output[type]['conn'][index] = Object.merge(OutputCradleConf, conn);
										//////console.log(input[type]['conn'][index]);
									//});
								//}
								break;
								
							default:
								throw new Error('Output ['+type+'] not implemented');
						}
					});
				}
				
				////console.log(pipe['output'][0]['cradle']);
				////console.log(PollHttpConf);
				//throw new Error();
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

var server = new Server();

//root.load(path.join(__dirname, '/apps'));

module.exports = server.express();
