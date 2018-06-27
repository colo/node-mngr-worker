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
			let path = d.key[0];
			let host = d.key[1];

			// console.log('other docs', d.key)


			if(!values[host]) values[host] = {};

			if(!values[host][path]) values[host][path] = {};

			debug_internals('os-stats filter get HOST %o', d.key[1]);

			Object.each(data, function(value, key){
				if(key != 'networkInterfaces' && key != 'totalmem'){

					if(!values[host][path][key]) values[host][path][key] = [];

					if(key == 'cpus' ){
						Array.each(value, function(cpu, core){
							if(!values[host][path][key][core]) values[host][path][key][core] = [];

							let data = {};
							data = {
								speed: cpu.speed,
								times: cpu.times
							};

							debug_internals('os-stats filter core %d', core);
							values[host][path][key][core].push(data);
						});//iterate on each core
					}
					else if(key == 'loadavg'){//keep only "last minute" value
						values[host][path][key].push(value[0]);
					}
					else{

						values[host][path][key].push(value);
					}

				}


			});
		});

		Object.each(values, function(host_data, host){

			Object.each(host_data, function(data, path){

				let new_doc = {data: {}, metadata: {range: {start: null, end: null}}};

				Object.each(data, function(value, key){

					debug_internals('os-stats filter value %o', value);

					if(key == 'cpus' ){
						let speed = [];
						let times = {};
						Array.each(value, function(sample){
							Array.each(sample, function(cpu, core){
								//if(!speed[core]) speed[core] = [];

								debug_internals('os-stats filter speed %o', cpu);

								//speed[core].push(cpu.speed)
								speed.push(cpu.speed);

								let sample_time = {};
								Object.each(cpu.times, function(time, key){//user,nice..etc
									if(!times[key]) times[key] = [];
									times[key].push(time);
								});

							});

						});

						Object.each(times, function(time, key){//user,nice..etc
							let min = ss.min(time);
							let max = ss.max(time);

							let data = {
								samples: time,
								min : ss.min(time),
								max : ss.max(time),
								mean : ss.mean(time),
								median : ss.median(time),
								mode : ss.mode(time),
								range: max - min,
							};

							times[key] = data;
						});

						let min = ss.min(speed);
						let max = ss.max(speed);

						new_doc['data'][key] = {
							//samples: value,
							speed: {
								samples: speed,
								min : ss.min(speed),
								max : ss.max(speed),
								mean : ss.mean(speed),
								median : ss.median(speed),
								mode : ss.mode(speed),
								range: max - min,
							},
							times: times
						};
					}
					else{
						let min = ss.min(value);
						let max = ss.max(value);

						new_doc['data'][key] = {
							samples : value,
							min : min,
							max : max,
							mean : ss.mean(value),
							median : ss.median(value),
							mode : ss.mode(value),
							range: max - min
						};
					}

					let historical_path = 'os.historical'

					if(path != 'os')
						historical_path = historical_path+'.'+path.replace('os.', '')

					new_doc['metadata'] = {
						type: 'minute',
						host: host,
						path: historical_path,
						range: {
							start: first,
							end: last
						}
					};


					next(new_doc, opts);
				});

			})
		});



	}

};
