'use strict'

const Moo = require("mootools"),
		BaseApp = require ('./base.conf');

//var winston = require('winston');
var debug = require('debug')('Server:App:Config');
var debug_internals = require('debug')('Server:App:Config:Internals');

module.exports = new Class({
  Extends: BaseApp,
  
  options: {
		
		pipelines: [
			//{
				//input: [
					//require('../etc/snippets/input.poll.http.schedule.template.js')
				//],
				//output: [
					//require('../etc/snippets/output.stdout.template.js')
				//],
			//}
		],
		
		 
		authentication: {
			users : [
					{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''},
					{ id: 2, username: 'test' , role: 'user', password: '123'}
			],
		},
		
		logs: {
			loggers: {
				error: null,
				access: null,
				profiling: null
			},
			
			path: './logs',
			
			//default: [
				//{ transport: winston.transports.Console, options: { colorize: 'true', level: 'warning' } },
				//{ transport: winston.transports.File, options: {level: 'info', filename: null } }
			//]
		},
		
		
		
	},
	
});
