'use strict'

const Moo = require("mootools"),
		BaseApp = require ('./base.conf');

//var winston = require('winston');

module.exports = new Class({
  Extends: BaseApp,
  
  options: {
		
		pipelines: [
			//{
				//input: [
					//{
						//poller: {
							//id: "localhost.http",
							//conn: [
								//{
									//scheme: 'http',
									//host:'127.0.0.1',
									//port: 8081,
								//}
							//],
							////requests: {
								////periodical: 5000,
							////},
						//},
					//},
				//],
				//output: [
					//{
						//cradle: {
							//id: "localhost.cradle",
							//conn: [
								//{
									//host: '127.0.0.1',
									//port: 5984,
									//db: 'dashboard',
									//opts: {
										//cache: true,
										//raw: false,
										//forceSave: true,
									//}
								//},
							//]
						//},
					//}
				//]
			//},
			
			/**
			 * munin
			 * */
			//{
				//input: [
					//{
						//poller: {
							//id: "remote.munin",
							//conn: [
								//{
									//scheme: 'munin',
									//host:'108.163.171.74',
									//port: 4949,
								//}
							//],
							//connect_retry_count: 5,
							//connect_retry_periodical: 5000,
							//requests: {
								//periodical: 2000,
							//},
						//},
					//}
				//],
			//},
			/**
			 * imap
			 * */
			{
				input: [
					{
						poller: {
							id: "remote.imap",
							conn: [
								{
									scheme: 'imap',
									host:'184.107.134.146',
									port: 143,
									opts: {
										user: 'user',
										password: 'passwd',
										//autotls: 'always',
										keepalive: true,
									}
								}
							],
							connect_retry_count: 5,
							connect_retry_periodical: 5000,
							requests: {
								periodical: 2000,
							},
						},
					}
				],
			},
		],
		
		//input: {
			
			//poll: {
				//"localhost" : [
					//{scheme: 'http', host:'127.0.0.1', port: 8081},
					//{scheme: 'cradle', host:'127.0.0.1', port: 5984}//(P|C)ouchDB
					////{scheme: 'http', host:'192.168.0.180', port: 5984 , db: 'dashboard'}//(P|C)ouchDB
				//],
			//},
		//},
		/**
		* @poller
		* */
		//clients: { 
			//"localhost" : [
				//{scheme: 'http', host:'127.0.0.1', port: 8081},
				//{scheme: 'cradle', host:'127.0.0.1', port: 5984}//(P|C)ouchDB
				////{scheme: 'http', host:'192.168.0.180', port: 5984 , db: 'dashboard'}//(P|C)ouchDB
			//], 
		//},
		/**
		* @poller
		* */
	   
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
