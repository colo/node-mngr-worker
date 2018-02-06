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
						path: '/hist',
						callbacks: ['hist'],
						version: '',
					},
					{
						path: '/hist/:key',
						callbacks: ['hist'],
						version: '',
					},
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
						path: ':key/config/:item',
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
  /**
	 * first precedence param
	 * @first: return first entry
	 * @first=n: return first N entries (ex: ?first=7, first 7 entries)
	 * 
	 * second precedence param
	 * @last: return last entry 
	 * @last=n: return last N entries (ex: ?last=7, last 7 entries)
	 * 
	 * third precedence params
	 * @start=n: return from N entry to last or @end (ex: ?start=0, return all entries)
	 * @end=n: set last N entry for @start (ex: ?start=0&end=9, return first 10 entries)
	 * */
	hist: function(err, resp, body){
		//console.log('DIRVISH VAULTS hist');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
	post: function(err, resp, body){
		//console.log('DIRVISH VAULTS post');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
	
  put: function(err, resp, body){
		//console.log('DIRVISH VAULTS put');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  get: function(err, resp, body){
		//console.log('DIRVISH VAULTS get');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
  },
  initialize: function(options){
		this.parent(options);//override default options
		
		this.log('dirvish-vaults', 'info', 'dirvish vaults started');
		
  },
  
});

