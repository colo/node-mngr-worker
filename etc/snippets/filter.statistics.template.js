var debug = require('debug')('filter:os-stats');
var debug_internals = require('debug')('filter:os-stats:Internals');

/**
 * recives an array of OS docs and does some statictics on freemem
 * 
 **/
module.exports = function(doc, opts, next){
						
	var ss = require('simple-statistics');
	
	debug_internals('os-stats filter doc %o', doc);
	debug_internals('os-stats filter length %o', doc.length);
	debug_internals('os-stats filter->next %o', next);
	
	if(typeof(doc) == 'array' || doc instanceof Array || Array.isArray(doc)){
		let first = doc[0].doc.metadata.timestamp;
		let last = doc[doc.length - 1].doc.metadata.timestamp;
		
		let values = {};
		Array.each(doc, function(d){
			let data = d.doc.data;
			let host = d.key[2];
			
			if(!values[host]) values[host] = {};
			
			debug_internals('os-stats filter get HOST %o', d.key[2]);
			
			Object.each(data, function(value, key){
				if(key != 'networkInterfaces' && key != 'cpus' && key != 'totalmem'){
					if(!values[host][key]) values[host][key] = [];
					
					if(key == 'loadavg'){//keep only "last minute" value
						values[host][key].push(value[0]);
					}
					else{
						values[host][key].push(value);
					}
					
				}	
				
				
			});
		});
		
		Object.each(values, function(data, host){
			
			let new_doc = {data: {}, metadata: {range: {start: null, end: null}}};
			
			Object.each(data, function(value, key){
				
				debug_internals('os-stats filter value %o', value);
			
				new_doc['data'][key] = {
					samples : value,
					min : ss.min(value).toFixed(2),
					max : ss.max(value).toFixed(2),
					avg : ss.mean(value).toFixed(2),
					median : ss.median(value).toFixed(2),
					harmonic : ss.harmonicMean(value).toFixed(2),
					geometric : ss.geometricMean(value).toFixed(2),
					//variance : ss.variance(freemems).toFixed(2),
					median_ab_deviation : ss.medianAbsoluteDeviation(value).toFixed(2)
				};
			
				new_doc['metadata'] = {
					host: host,
					range: {
						start: first,
						end: last
					}
				};
				
				next(new_doc, opts);
			});
			
		});
		
		
		
	}
	
};
