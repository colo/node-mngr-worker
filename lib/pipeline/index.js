'use strict'

const	mootools = require('mootools'),
			Poller = require('./input/poller'),
			CradleOutput = require('./output/cradle');

var debug = require('debug')('Server:App:Pipeline');
var debug_internals = require('debug')('Server:App:Pipeline:Internals');
var debug_events = require('debug')('Server:App:Pipeline:Events');

module.exports = new Class({
  Implements: [Options, Events],
	
	ON_SUSPEND: 'onSuspend',
	ON_RESUME: 'onResume',
	ON_EXIT: 'onExit',
	
	ON_ONCE: 'onOnce',
	ON_RANGE: 'onRange',
	
	ON_DOC: 'onDoc',
	ON_DOC_ERROR: 'onDocError',
	
	ON_ONCE_DOC: 'onOnceDoc',
	ON_ONCE_DOC_ERROR: 'onOnceDocError',
							
	ON_PERIODICAL_DOC: 'onPeriodicalDoc',
	ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',
	
	ON_SAVE_DOC: 'onSaveDoc',
	ON_SAVE_MULTIPLE_DOCS: 'onSaveMultipleDocs',
	
	inputs: [],
	//filters: [],
	outputs: [],
	
	options: {
		input: null,
		filters: null,
		output: null,
		
	},
	initialize: function(options){
		this.setOptions(options);
		
		//console.log(this.options);
		
		if(this.options.input){
			Array.each(this.options.input, function(input){
				
				let type = Object.keys(input)[0];
				//console.log(input[type]);
				
				//throw new Error();
				
				//var input_instance = null;
				
				switch (type){
					case 'poller':
						debug_internals('Adding PollerInput %o', input[type]);
						
						this.inputs.push(new Poller(input[type]));
						
						break;
						
					default:
						throw new Error('Input ['+type+'] not implemented');
				}
				
				//if(input_instance != null){
					//this.addEvent(this.ON_SUSPEND, function(req){
					//});
				//}
				
			}.bind(this));

		}
		
		if(this.options.output){
			Array.each(this.options.output, function(output){
				let type = Object.keys(output)[0];
				
				
				switch (type){
					case 'cradle':
						
						debug_internals('Adding CradleOutput %o', output[type]);
						
						this.outputs.push(new CradleOutput(output[type]));
						
						break;
						
					default:
						throw new Error('Output ['+type+'] not implemented');
				}
				
			}.bind(this));
		}
		
		this.start();
	},
	start: function(){
		Array.each(this.inputs, function(input){
			this.addEvent(this.ON_SUSPEND, function(req){
				input.fireEvent(input.ON_SUSPEND, req);
			});
			this.addEvent(this.ON_RESUME, function(req){
				input.fireEvent(input.ON_RESUME, req);
			});
			this.addEvent(this.ON_EXIT, function(req){
				input.fireEvent(input.ON_EXIT, req);
			});
			this.addEvent(this.ON_RANGE, function(req){
				input.fireEvent(input.ON_RANGE, req);
			});
			this.addEvent(this.ON_ONCE, function(req){
				input.fireEvent(input.ON_ONCE, req);
			});
			
			//input['ON_SAVE_DOC'] = this.ON_SAVE_DOC;
			//input['ON_SAVE_MULTIPLE_DOCS'] = this.ON_SAVE_MULTIPLE_DOCS;
			
			//input.addEvent(input.ON_SAVE_DOC, function(doc){
				//this.fireEvent(this.ON_SAVE_DOC, doc);
			//}.bind(this));
			
			//input.addEvent(input.ON_SAVE_MULTIPLE_DOCS, function(docs){
				//this.fireEvent(this.ON_SAVE_MULTIPLE_DOCS, [docs]);
			//}.bind(this));
			
			input.addEvent(input.ON_ONCE_DOC, function(doc, opts){
				debug_events('input.ON_ONCE_DOC %o', doc);
				
				if(this.options.filters.length > 0){
					opts.input = input;
					//doc = this._apply_filters(doc, opts);
					this._apply_filters(doc, opts);
				}
				else{
					this.fireEvent(this.ON_SAVE_DOC, doc);
				}
				
				
			}.bind(this));
			
			input.addEvent(input.ON_PERIODICAL_DOC, function(doc, opts){
				debug_events('input.ON_PERIODICAL_DOC %o', doc);
				
				if(this.options.filters.length > 0){
					opts.input = input;
					//doc = this._apply_filters(doc, opts);
					this._apply_filters(doc, opts);
				}
				else{
					this.fireEvent(this.ON_SAVE_DOC, doc);
				}
				
			}.bind(this));
			
			input.addEvent(input.ON_RANGE_DOC, function(doc, opts){
				debug_events('input.ON_RANGE_DOC %o', doc);
				
				if(this.options.filters.length > 0){
					opts.input = input;
					//doc = this._apply_filters(doc, opts);
					this._apply_filters(doc, opts);
				}
				else{
					this.fireEvent(this.ON_SAVE_DOC, doc);
				}
				
			}.bind(this));
			
			input.connect();
		}.bind(this));
		
		Array.each(this.outputs, function(output){
			this.addEvent(this.ON_SAVE_DOC, function(doc){
				debug_events('ON_SAVE_DOC %o', doc);
				output.fireEvent(output.ON_SAVE_DOC, doc);
			}.bind(this));
			
			this.addEvent(this.ON_SAVE_MULTIPLE_DOCS, function(docs){
				debug_events('ON_SAVE_MULTIPLE_DOCS %o', docs);
				output.fireEvent(output.ON_SAVE_MULTIPLE_DOCS, [docs]);
			}.bind(this));
			
			//input.connect();
		}.bind(this));
		
	},
	_apply_filters: function(doc, opts){
		
		debug_internals('_apply_filters %o', doc);
		debug_internals('_apply_filters opts %o', opts);
		
		/**
		 * test
		 * */
		//this.filters = [
			//function(doc){
				//Array.each(doc.data, function(value, index){
					//doc.data[index] = ++value;
				//});
				
				//return doc;
			//},
			//function(doc){
				//doc.data.push(99);
				//return doc;
			//}
		//];
		/**
		 * test
		 * */
		
		//Array.each(this.options.filters, function(filter){
		//for(let i = 0; i < this.options.filters.length; i++){
			//let filter = this.options.filters[i];
			//let next = function(doc){
				
				//if(i == this.options.filters.length - 1){
					//this.fireEvent(this.ON_SAVE_DOC, doc);
				//}
				//else{
					//next(doc);
				//}
					
			//}.bind(this);
			
			//debug_internals('_apply_filters->filter %o', filter);
			
			//filter(doc, opts, next);
		
		//}
		//let next = null;
		
		let filter = this.options.filters[0];
		let current = null;
		let prev = null;
		
		for(let i = this.options.filters.length - 1; i >= 0 ; i--){
			//if(current == null){
				//current = this.options.filters[i];
				
				//prev = function(save_doc){
					//this.fireEvent(this.ON_SAVE_DOC, save_doc);
				//}.bind(this);
				
			//}
			//else{
				//prev = current;
				//current = this.options.filters[i];
			//}
			
			//debug_internals('_apply_filters->filter %o', current);
			
			//current = this.options.filters[i].pass([doc, opts, prev]);
			
			if(i == this.options.filters.length - 1){
				current = function(filtered_doc, opts){
					this.options.filters[i](filtered_doc, opts, function(save_doc){
						this.fireEvent(this.ON_SAVE_DOC, save_doc);
					}.bind(this));
				}.bind(this);
			}
			else if(i != 0){
				prev = current;
				current = function(filtered_doc, opts){
					this.options.filters[i](filtered_doc, opts, function(new_doc, opts){
						prev(new_doc, opts);
					}.bind(this));
				}.bind(this);
			}
			
			if(i == 0){//first filter, start running
				this.options.filters[i](doc, opts, current);
			}
			
			
			//current(doc, opts, prev);
			
		
		}
		
		//filter(doc, opts, current);
		
		//}.bind(this));
		
		//debug_internals('_apply_filters->doc %o', doc);
		
		//return doc;
	}
  
});


