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
			{
				input: [
					{
						poller: {
							id: "localhost.http",
							conn: [
								{
									scheme: 'http',
									host:'127.0.0.1',
									port: 8081,
								}
							],
							requests: {
								periodical: 5000,
							},
						},
					},
				],
				filters: [
					function(doc, opts){
						let { type, input, poll, app } = opts;
						
						let doc_id = input.options.id +'.'+poll.options.id +'.'+app.options.id;
						let timestamp = Date.now();
						
						if(!doc.data){
							var new_doc = { data: null };
							if(Array.isArray(doc)){
								new_doc.data = doc;
							}
							else{
								new_doc.data = (doc instanceof Object) ? Object.clone(doc) : doc;
							}
							
							doc = new_doc;
						}
						
						debug_internals('TO _sanitize_doc %o', doc);
						
						if(!doc._id){
							doc._id = doc_id +'@'+timestamp;
						}
						
						doc['metadata'] = {
							id: input.options.id,
							host: poll.options.id,
							path: app.options.id,
							type: type,
							timestamp: timestamp
						};
						
						debug_internals('_sanitize_doc %o', doc);
						
						return doc;
					}
				],
				output: [
					{
						cradle: {
							id: "localhost.cradle",
							conn: [
								{
									host: '127.0.0.1',
									port: 5984,
									db: 'dashboard',
									opts: {
										cache: true,
										raw: false,
										forceSave: true,
									}
								},
							]
						},
					}
				]
			},
			
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
								require('../devel/imap.infraestructura')
							],
							connect_retry_count: 5,
							connect_retry_periodical: 5000,
							requests: {
								periodical: 2000,
							},
						},
					}
				],
				filters: [
					function(doc, opts){
						let { type, input, poll, app } = opts;
						
						let doc_id = input.options.id +'.'+poll.options.id +'.'+app.options.id;
						let timestamp = Date.now();
						
						//let metadata = {
							////domain: domain,
							////id: poll_id,
							//id: input.options.id,
							//host: poll.options.id,
							//path: app.options.id,
							//type: type,
							//timestamp: timestamp
						//};
						
						if(!doc.data){
							var new_doc = { data: null };
							if(Array.isArray(doc)){
								new_doc.data = doc;
							}
							else{
								new_doc.data = (doc instanceof Object) ? Object.clone(doc) : doc;
							}
							
							doc = new_doc;
						}
						
						debug_internals('TO _sanitize_doc %o', doc);
						
						if(!doc._id){
							doc._id = doc_id +'@'+timestamp;
						}
						
						doc['metadata'] = {
							id: input.options.id,
							host: poll.options.id,
							path: app.options.id,
							type: type,
							timestamp: timestamp
						};
						
						//doc['metadata']	 = Object.clone(metadata);
						//doc['metadata']['type'] = null;
						//doc['metadata']['client'] = null;
						//doc['metadata']['timestamp'] = timestamp;
						
						debug_internals('_sanitize_doc %o', doc);
						
						return doc;
					}
				],
				output: [
					{
						cradle: {
							id: "localhost.cradle",
							conn: [
								{
									host: '127.0.0.1',
									port: 5984,
									db: 'dashboard',
									opts: {
										cache: true,
										raw: false,
										forceSave: true,
									}
								},
							]
						},
					}
				]
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
