
'use strict'

const	mootools = require('mootools'),
			cradle = require('cradle-pouchdb-server');

var debug = require('debug')('Server:App:Pipeline:Output:Cradle');
var debug_events = require('debug')('Server:App:Pipeline:Output:Cradle:Events');
var debug_internals = require('debug')('Server:App:Pipeline:Output:Cradle:Internals');
			
/**
 * CradleOutput
 * 
 * */
module.exports = new Class({
  Implements: [Options, Events],
  
  dbs: [],
  buffer: [],
  buffer_expire: 0,
  
  ON_DOC: 'onDoc',
	//ON_DOC_ERROR: 'onDocError',
	
	ON_ONCE_DOC: 'onOnceDoc',
	//ON_ONCE_DOC_ERROR: 'onOnceDocError',
							
	ON_PERIODICAL_DOC: 'onPeriodicalDoc',
  //ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',
  
  ON_SAVE_DOC: 'onSaveDoc',
  ON_SAVE_MULTIPLE_DOCS: 'onSaveMultipleDocs',
  
  options: {
		id: null,
		conn: [
			{
				host: '127.0.0.1',
				port: 5984,
				db: '',
				opts: {
					cache: true,
					raw: false,
					forceSave: true,
				},
			},
		],
		
		buffer:{
			size: 10,
			expire: 5000, //miliseconds
			periodical: 1000 //how often will check if buffer timestamp has expire
		}
	},
	
	initialize: function(options){
		//console.log('---CradleOutput->init---');
		//throw new Error();
		
		this.setOptions(options);
		
		if(typeOf(this.options.conn) != 'array'){
			var conn = this.options.conn;
			this.options.conn = [];
			this.options.conn.push(conn);
		}
	
		Array.each(this.options.conn, function(conn, index){
			this.dbs.push( new(cradle.Connection)(conn.host, conn.port, conn.opts).database(conn.db) );
		}.bind(this));
		
		
		
		this.addEvent(this.ON_SAVE_DOC, function(doc){
			debug_events('this.ON_SAVE_DOC %o', doc);
			
			this.save(doc);
		}.bind(this));
		
		this.addEvent(this.ON_SAVE_MULTIPLE_DOCS, function(docs){
			debug_events('this.ON_SAVE_MULTIPLE_DOCS %o', docs);
			
			this.save(docs);
		}.bind(this));
		
		this.buffer_expire = Date.now() + this.options.buffer.expire;
		this._save_buffer.periodical(this.options.buffer.periodical, this);
		
	},
	save: function(doc){
		debug('save %o', doc);
		
		if( this.buffer.length < this.options.buffer.size &&
				this.buffer_expire > Date.now()
		){
			
			this.buffer.push(doc);
			
		}
		else{
			var doc = this.buffer;
			
			Array.each(this.dbs, function(db, index){
				
				db.exists(function (err, exists) {
					if (err) {
						debug_internals('db.exists error %o', err);
					}
					else if (exists) {
						////console.log('the force is with you.');
						this._save_docs(doc);
					}
					else {
						////console.log('database does not exists.');
						this.db.create(function(err){
							if(!err){
								this._save_docs(doc);
							}
							else{
								debug_internals('db.create error %o', err);
							}
						}.bind(this));
					}
				}.bind(this));
				
			}.bind(this));
			
			
				
			this.buffer = [];
			this.buffer_expire = Date.now() + this.options.buffer.expire;
			
		}
	},
	_save_docs: function(doc){
		debug_internals('_save_docs %o', doc);
		
		Array.each(this.dbs, function(db, index){
			
			if(typeOf(doc) == 'array' && doc.length > 0){
				db.save(doc, function (err, res) {
					if(err){
						debug_internals('BULK db.save %o', err);
					}
					else{
						//console.log('BULK SAVE RESP');
						//console.log(res);
					}
					//throw new Error();
				});

			}
			else if(typeOf(doc) != 'array'){
				db.save(doc._id, doc, function (err, res) {
					if(err){
						debug_internals('db.save %o', err);
					}
					//else{
						////console.log('SAVE RESP');
						////console.log(res);
					//}
					//throw new Error();
				});
			}
			
		}.bind(this));
		
		
	},
	_save_buffer: function(){
		debug_internals('_save_buffer');
			
		if(this.buffer_expire <= Date.now()){
			var doc = this.buffer;
			this._save_docs(doc);
			this.buffer = [];
			this.buffer_expire = Date.now() + this.options.buffer.expire;
			
			debug_internals('_save_buffer %o', doc);
		}

	}
});
