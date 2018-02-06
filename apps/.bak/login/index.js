'use strict'

var App = require('node-app-http-client'),
	path = require('path'),
	util = require('util');


module.exports = new Class({
  Extends: App,
  
  
  options: {
	  
		routes: {
			
			get: [
				{
				path: '',
				callbacks: ['get']
				},
			]
		},
		
		api: {
			
			version: '1.0.0',
			
			routes: {
				post: [
					{
					path: '',
					callbacks: ['login'],
					version: '',
					},
				],
				get: [
					{
					path: '',
					callbacks: ['get'],
					version: '',
					},
				]
			},
			
		},
  },
  login: function(err, resp, body){
		//console.log('LOGIN login');
		
		//console.log(this.options.id);
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  get: function(err, resp, body){
		//console.log('LOGIN get');
		
		//console.log(this.options.id);
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  initialize: function(options){
		this.profile('login_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('login_init');//end profiling
		
		this.log('login', 'info', 'login started');
  },
  
});
