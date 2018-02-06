'use strict'

var App = require('node-app-http-client'),
	path = require('path'),
	util = require('util');

module.exports = new Class({
  Extends: App,
  
  LOGGED_OUT: 'logged_out',
  
  options: {
	  
		routes: {
			
			get: [
				{
				path: '',
				callbacks: ['logout']
				},
			]
		},
		
		api: {
			//content_type: 'application/json',
			version: '1.0.0',
			
			routes: {
				get: [
					{
						path: '',
						callbacks: ['logout'],
						version: '',
					},
				]
			},
			
		},
  },
  logout: function(err, resp, body){
		
		//console.log('LOGOUT get');
		
		//console.log(this.options.id);
		
		//console.log('error');
		//console.log(err);
		
		//console.log('resp');
		//console.log(resp.statusCode);
		
		//console.log('body');
		//console.log(body);
		
		//console.log(this['$events']);
		
		this.fireEvent(this.LOGGED_OUT);
	
  },
  initialize: function(options){
		
		this.profile('logout_init');//start profiling
		
		this.parent(options);//override default options
		
		this.profile('logout_init');//end profiling
		
		this.log('logout', 'info', 'logout started');
		
		//this.addEvent(this.LOGGED_OUT, function(){
			////console.log(' initialize event...');
		//});
  },
	
});

