'use strict'

var App = require('node-app-http-client'),
	path = require('path');
	


module.exports = new Class({
  Extends: App,
  
  
  options: {
	  
		params: {
			//route_id: /^[0-9]+$/,
			route: /^(0|[1-9][0-9]*)$/,
		},
		
		api: {
			
			version: '1.0.0',
			
			routes: {
				get: [
					{
						path: 'smtp/allow/:route',
						callbacks: ['smtp_allow'],
						version: '',
					},
					{
						path: 'smtp/allow',
						callbacks: ['smtp_allow'],
						version: '',
					},
					{
						path: 'smtp/routes/:route',
						callbacks: ['smtp_routes'],
						version: '',
					},
					{
						path: 'smtp/routes',
						callbacks: ['smtp_routes'],
						version: '',
					},
					{
						path: '',
						callbacks: ['info'],
						version: '',
					},
				]
			},
			
		},
  },
  info: function(err, resp, body){
		//console.log('QMAIL info');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  smtp_routes: function(err, resp, body){
		//console.log('QMAIL smtp_routes');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  smtp_allow: function(err, resp, body){
		//console.log('QMAIL smtp_allow');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  initialize: function(options){
			
		this.parent(options);//override default options
			
		this.log('qmail', 'info', 'qmail started');	
		
  },
	
});

