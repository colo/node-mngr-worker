var debug = require('debug')('filter:os-hour-stats');
var debug_internals = require('debug')('filter:os-hour-stats:Internals');

/**
 * recives an array of OS docs and does some statictics on freemem
 * 
 **/
module.exports = function(doc, opts, next){
						
	var ss = require('simple-statistics');
	
	debug_internals('os-hour-stats filter doc %o', doc);
	debug_internals('os-hour-stats filter length %o', doc.length);
	//debug_internals('os-hour-stats filter->next %o', next);
	
	if(typeof(doc) == 'array' || doc instanceof Array || Array.isArray(doc)){
		let first = doc[0].doc.metadata.timestamp;
		let last = doc[doc.length - 1].doc.metadata.timestamp;
		
		let values = {};
		Array.each(doc, function(row){
			
			let metadata = row.doc.metadata;
			let data = row.doc.data;
			let host = row.key[1];
			
			//debug_internals('os-hour-stats filter row %s - %o', host, data);
			
			if(!values[host]) values[host] = {};
			
			//debug_internals('os-hour-stats filter get HOST %o', row.key[1]);
			
			Object.each(data, function(value, key){
				//if(key != 'networkInterfaces' && key != 'totalmem'){
					if(!values[host][key]) values[host][key] = [];
					
					if(key == 'cpus' ){
						Array.each(value['samples'], function(core_data, core){
							if(!values[host][key][core]) values[host][key][core] = {};
							
							Array.each(core_data, function(sample){//each "core_data" has an array of samples
								if(!values[host][key][core]['speed']) values[host][key][core]['speed'] = [];
								if(!values[host][key][core]['times']) values[host][key][core]['times'] = [];
								
								//let data = { speed: [], times: []};
								//data.speed.append(sample.speed);
								//data.times.append(sample.times);
								
								//debug_internals('os-hour-stats filter sample %o', values[host][key][core]['speed']);
								values[host][key][core]['speed'].push(sample.speed);
								values[host][key][core]['times'].push(sample.times);
								
							});
							
							
						});//iterate on each core
					}
					else{
						values[host][key].append(value['samples']);
					}
					
				//}	
				
				
			});
		});
		
		debug_internals('values %o', values);
		//throw new Error();
		
		Object.each(values, function(data, host){
			
			let new_doc = {data: {}, metadata: {range: {start: null, end: null}}};
			
			Object.each(data, function(value, key){
				
				debug_internals('os-hour-stats filter value %o', value);
				
				if(key == 'cpus' ){
					let speed = [];
					let times = {};
					//Array.each(value, function(sample){
						//Array.each(sample, function(cpu, core){
							////if(!speed[core]) speed[core] = [];
							
							//debug_internals('os-hour-stats filter speed %o', cpu);
						
							////speed[core].push(cpu.speed)
							//speed.push(cpu.speed);
							
							//let sample_time = {};
							//Object.each(cpu.times, function(time, key){//user,nice..etc
								//if(!times[key]) times[key] = [];
								//times[key].push(time);
							//});
							
						//});
						
					//});
					
					//Object.each(times, function(time, key){//user,nice..etc
						//let data = {
							//min : ss.min(time),
							//max : ss.max(time),
							//avg : ss.mean(time),
							//median : ss.median(time),
						//};
						
						//times[key] = data;
					//});
					
					////Array.each(speed, function(cpu, core){//do the statictics
						////let data = {
							////min : ss.min(cpu),
							////max : ss.max(cpu),
							////avg : ss.mean(cpu),
							////median : ss.median(cpu),
						////};
						
						////speed[core] = data;
					////});
					
					
					//new_doc['data'][key] = {
						//samples: value,
						//speed: {
							//min : ss.min(speed),
							//max : ss.max(speed),
							//avg : ss.mean(speed),
							//median : ss.median(speed),
						//},
						//times: times
					//};
				}
				else{
					new_doc['data'][key] = {
						samples : value,
						min : ss.min(value),
						max : ss.max(value),
						avg : ss.mean(value),
						median : ss.median(value),
						//harmonic : ss.harmonicMean(value),
						//geometric : ss.geometricMean(value),
						//variance : ss.variance(freemems),
						//median_ab_deviation : ss.medianAbsoluteDeviation(value)
					};
				}
				
				new_doc['metadata'] = {
					type: 'hour',
					host: host,
					range: {
						start: first,
						end: last
					}
				};
				
				debug_internals('os-hour-stats filter value %o', new_doc);
				throw new Error();
				//next(new_doc, opts);
			});
			
		});
		
		
		
	}
	
};
