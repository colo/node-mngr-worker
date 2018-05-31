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
			let timestamp = d.doc.metadata.timestamp;
			let host = d.key[1];

			if(!values[host]) values[host] = {};

			debug_internals('os-stats filter get HOST %o', d.doc.metadata.timestamp);

			Object.each(data, function(value, key){
				if(key != 'networkInterfaces' && key != 'totalmem'){
					if(!values[host][key] && key == 'cpus'){
						values[host][key] = [];
					}
					else if(!values[host][key]){
						values[host][key] = {};
						// values[host][key] = [];
					}

					if(key == 'cpus' ){
						Array.each(value, function(cpu, core){
							if(!values[host][key][core])
								values[host][key][core] = {}
								// values[host][key][core] = [];

							let data = {};
							data = {
								speed: cpu.speed,
								times: cpu.times
							};

							debug_internals('os-stats filter core %d', core);
							// values[host][key][core].push(data);
							values[host][key][core][timestamp] = data
						});//iterate on each core
					}
					else if(key == 'loadavg'){//keep only "last minute" value
						// values[host][key].push(value[0]);
						values[host][key][timestamp] = value[0]
					}
					else{
						// values[host][key].push(value);
						values[host][key][timestamp] = value
					}

				}


			});
		});

		Object.each(values, function(data, host){

			let new_doc = {data: {}, metadata: {range: {start: null, end: null}}};

			Object.each(data, function(value, key){

				debug_internals('os-stats filter value %s %s', key, typeof(value));

				if(key == 'cpus' ){
					let speed = {};
					let times = {};

					Array.each(value, function(sample){
						debug_internals('os-stats filter cpu sample %o', sample);

						// Array.each(sample, function(cpu, core){
						Object.each(sample, function(cpu, timestamp){
							//if(!speed[core]) speed[core] = [];

							debug_internals('os-stats filter speed %o', cpu);

							// speed.push(cpu.speed);
							speed[timestamp] = cpu.speed

							let sample_time = {};
							Object.each(cpu.times, function(time, key){//user,nice..etc
								if(!times[key])
									times[key] = {};
									// times[key] = [];

								// times[key].push(time);
								times[key][timestamp] = time;
							});

						});

					});

					Object.each(times, function(time, key){//user,nice..etc
						let data_values = Object.values(time);

						let min = ss.min(data_values);
						let max = ss.max(data_values);

						let data = {
							samples: time,
							min : ss.min(data_values),
							max : ss.max(data_values),
							mean : ss.mean(data_values),
							median : ss.median(data_values),
							mode : ss.mode(data_values),
							range: max - min,
						};

						times[key] = data;
					});

					let data_values = Object.values(speed);

					let min = ss.min(data_values);
					let max = ss.max(data_values);

					new_doc['data'][key] = {
						//samples: value,
						speed: {
							samples: speed,
							min : ss.min(data_values),
							max : ss.max(data_values),
							mean : ss.mean(data_values),
							median : ss.median(data_values),
							mode : ss.mode(data_values),
							range: max - min,
						},
						times: times
					};
				}
				else{
					let data_values = Object.values(value);
					let min = ss.min(data_values);
					let max = ss.max(data_values);

					new_doc['data'][key] = {
						samples : value,
						min : min,
						max : max,
						mean : ss.mean(data_values),
						median : ss.median(data_values),
						mode : ss.mode(data_values),
						range: max - min
					};
				}

				new_doc['metadata'] = {
					type: 'minute',
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
