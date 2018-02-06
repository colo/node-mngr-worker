//'use strict'

var App = require('node-app-http-client'),
	fs = require('fs'),
	path = require('path');
	
	//zonefile = require('dns-zonefile'); not working....colliding with mootools??

//command line zonefile works
var sys = require('sys'),
	exec = require('child_process').exec,
	zonefile = path.join(__dirname,'./node_modules/dns-zonefile/bin/zonefile');
	


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
						path: ':zone',
						callbacks: ['get_zone'],
						version: '',
					},
					{
						path: ':zone/:prop',
						callbacks: ['get_zone'],
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
  get_zone: function (err, resp, body){
		//console.log('BIND ZONES get_zone');
		
		//console.log('error');
		//console.log(err);
		
		////console.log('resp');
		////console.log(resp);
		
		//console.log('body');
		//console.log(body);
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
  get: function (err, resp, body){
		//console.log('BIND ZONES get_zone');
		
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

