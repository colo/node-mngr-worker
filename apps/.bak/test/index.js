'use strict'

var App = require('node-app-http-client'),
	path = require('path');
	


module.exports = new Class({
  Extends: App,
  
  
  options: {
		id: 'test',
		
		authorization: {
			init: false,
			config: path.join(__dirname,'./config/rbac.json'),
		},
		
		routes: {
			
			get: [
				{
					path: '',
					callbacks: ['get']
				},
				{
					path: '/:service_action',
					callbacks: ['get'],
				}
			],
			post: [
				{
					path: '',
					callbacks: ['post']
				},
			],
			
		},
		
		
  },
  get: function(err, resp, body){
		//console.log('TEST get');
		
		//console.log(this.options.id);
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  
  post: function(err, resp, body){
		//console.log('TEST post');
		
		//console.log(this.options.id);
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  
  initialize: function(options){
		this.profile('test_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('test_init');//end profiling
		
		this.log('test', 'info', 'test started');
  },
	
});

