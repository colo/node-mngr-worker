'use strict'

var App = require('node-app-imap-client');

var debug = require('debug')('Server:Apps:Imap');

module.exports = new Class({
  Extends: App,
  
  //ON_CONNECT: 'onConnect',
  //ON_CONNECT_ERROR: 'onConnectError',
  
  options: {
		
		requests : {
			once: [
				{
					search: {
						//uri: 'INBOX',
						uri: 'INBOX/?openReadOnly=false',
						//uri: 'INBOX/?openReadOnly=false&modifiers.something=xxx',
						opts: {//search options
							
						}
					}
				}
			],
			periodical: [
				//{ list: { uri: '' } },
				//{ fetch: { uri: 'apache_accesses' } },
				//{ fetch: { uri: 'if_eth0' } },
				//{ config: { uri: 'if_eth0' } },
				//{ nodes: { uri: '' } },
				//{ quit: { uri: '' } },
			],
			//range: [
				////{ get: {uri: 'dashboard/cache', doc: 'localhost.colo.os.blockdevices@1515636560970'} },
			//],
			
		},
		
		routes: {
			search: [
				{
					path: ':mailbox/?options',
					callbacks: ['search']
				}
			],
		},
		
  },
  search: function(err, resp, options){
		debug('search err %o', err);
		debug('search %o', resp);
		debug('search options %o', options);
	},
  initialize: function(options){
	
	
		this.parent(options);//override default options
		
		this.log('imap_test', 'info', 'imap_test started');
		
		debug('initialized %o', options);
		
  },
  
	
});

