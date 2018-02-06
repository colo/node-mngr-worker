'use strict'

var App = require('node-app-http-client');
	


module.exports = new Class({
  Extends: App,
  
  
  options: {
	  
		routes: {
			
		},
		
		api: {
			
			version: '1.0.0',
			
			routes: {
				get: [
					{
						path: '/',
						callbacks: ['get'],
						version: '',
					},
				]
			},
			
		},
  },
  get: function (err, resp, body){
		//console.log('BIND get');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  initialize: function(options){
	
	this.parent(options);//override default options
	
	this.log('bind', 'info', 'bind started');
  },
	
});

