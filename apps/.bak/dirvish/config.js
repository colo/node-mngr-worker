'use strict'

var App = require('node-app-http-client'),
	path = require('path');
	
module.exports = new Class({
  Extends: App,
  
  options: {
	  
		
		routes: {
		},
		
		api: {
			
			version: '1.0.0',
			
			routes: {
				post: [
					{
						path: '',
						callbacks: ['post'],
						version: '',
					}
				],
				put: [
					{
						path: '',
						callbacks: ['put'],
						version: '',
					}
				],
				
				get: [
					{
						path: ':key',
						callbacks: ['get'],
						version: '',
					},
					{
						path: ':key/:prop',
						callbacks: ['get'],
						version: '',
					},
					{
						path: '',
						callbacks: ['get'],
						version: '',
					},
				]
			},
			
		},
  },
  post: function(err, resp, body){
		//console.log('DIRVISH CONFIG post');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  put: function(err, resp, body){
		//console.log('DIRVISH CONFIG put');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  get: function(err, resp, body){
		//console.log('DIRVISH CONFIG get');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  initialize: function(options){
		this.parent(options);//override default options
		
		this.log('dirvish-config', 'info', 'dirvish config started');
		
  },

  
});

