'use strict'

var App = require('node-app-imap-client');

var debug = require('debug')('Server:Apps:Imap');

module.exports = new Class({
  Extends: App,
  
  //ON_CONNECT: 'onConnect',
  //ON_CONNECT_ERROR: 'onConnectError',
  
  options: {
		
		path: '',
		
		requests : {
			once: [
				{
					'search': {
						uri: '',
						//uri: 'INBOX',
						//uri: 'INBOX/?openReadOnly=false', //readonly || openReadOnly
						//uri: '?openReadOnly=false',
						//uri: 'INBOX/?openReadOnly=false&modifiers.something=xxx',
						opts: ['ALL']//search params
					},
					'seq.search': {
						uri: '',
						//uri: 'INBOX',
						//uri: 'INBOX/?openReadOnly=false', //readonly || openReadOnly
						//uri: '?openReadOnly=false',
						//uri: 'INBOX/?openReadOnly=false&modifiers.something=xxx',
						opts: ['ALL']//search params
					},
					//'fetch': {
						//uri: '',
						////uri: 'INBOX',
						////uri: 'INBOX/?openReadOnly=false', //readonly || openReadOnly
						////uri: '?openReadOnly=false',
						////uri: 'INBOX/?openReadOnly=false&modifiers.something=xxx',
						//opts: [//fetch params
							//118574,
							//{//fetch options
								//bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
								//struct: true
							//}
						//]
					//}
					//'seq.fetch': {
						//uri: '',
						////uri: 'INBOX',
						////uri: 'INBOX/?openReadOnly=false', //readonly || openReadOnly
						////uri: '?openReadOnly=false',
						////uri: 'INBOX/?openReadOnly=false&modifiers.something=xxx',
						//opts: [//fetch params
							//'1:3',
							//{//fetch options
								//bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
								//struct: true
							//}
						//]
					//}
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
					path: ':mailbox?/:options?',
					callbacks: ['search']
				},
			],
			'seq.search': [
				{
					path: ':mailbox?/:options?',
					callbacks: ['seq_search']
				},
			],
			fetch: [
				{
					path: ':mailbox?/:options?',
					callbacks: ['fetch']
				},
			],
			'seq.fetch': [
				{
					path: ':mailbox?/:options?',
					callbacks: ['seq_fetch']
				},
			],
		},
		
  },
  search: function(err, resp, options){
		debug('search err %o', err);
		debug('search %o', resp);
		debug('search options %o', options);
	},
	seq_search: function(err, resp, options){
		debug('seq_search err %o', err);
		debug('seq_search %o', resp);
		debug('seq_search options %o', options);
	},
	fetch: function(err, resp, options){
		debug('fetch err %o', err);
		debug('fetch %o', resp);
		debug('fetch options %o', options);
	},
	seq_fetch: function(err, resp, options){
		debug('seq_fetch err %o', err);
		debug('seq_fetch %o', resp);
		debug('seq_fetch options %o', options);
	},
  initialize: function(options){
	
	
		this.parent(options);//override default options
		
		this.log('imap_test', 'info', 'imap_test started');
		
		debug('initialized %o', options);
		
  },
  
	
});

