var debug = require('debug')('filter:os-hour-stats');
var debug_internals = require('debug')('filter:os-hour-stats:Internals');

/**
 * recives an array of OS docs and does some statictics on freemem
 *
 **/
module.exports = function(doc, opts, next, pipeline){

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
			let timestamp = row.doc.metadata.timestamp;
			let data = row.doc.data;
			let host = row.key[1];

			debug_internals('os-hour-stats filter row %s - %o', host, data);

			if(!values[host]) values[host] = {};

			Object.each(data, function(value, key){
				//if(key != 'networkInterfaces' && key != 'totalmem'){
					// if(!values[host][key]) values[host][key] = [];
					if(!values[host][key] && key == 'cpus'){
						values[host][key] = [];
					}
					else if(!values[host][key]){
						values[host][key] = {};
						// values[host][key] = [];
					}

					if(key == 'cpus' ){

						Object.each(value, function(cpu_value, cpu_key){
							if(!values[host][key][cpu_key])
								values[host][key][cpu_key] = {};
								// values[host][key][cpu_key] = [];

							if(cpu_key == 'times'){
								Object.each(cpu_value, function(times_value, times_key){

									if(!values[host][key][cpu_key][times_key])
										values[host][key][cpu_key][times_key] = {};
										// values[host][key][cpu_key][times_key] = [];

									// values[host][key][cpu_key][times_key].push(times_value['mean']);
									values[host][key][cpu_key][times_key][timestamp] = times_value['mean'];

								});
							}
							else{
								// values[host][key][cpu_key].push(cpu_value['mean']);
								values[host][key][cpu_key][timestamp] = cpu_value['mean'];
							}

						});//iterate on each core
					}
					else{
						values[host][key][timestamp] = value['mean'];
						// values[host][key].push(value['mean']);
					}

				//}


			});
		});

		debug_internals('values %o', values);
		// throw new Error();



		Object.each(values, function(data, host){
			let new_doc = {data: {}, metadata: {range: {start: null, end: null}}};

			Object.each(data, function(value, key){

				//debug_internals('os-hour-stats filter value %o', value);

				if(key == 'cpus' ){

					let speed = {};
					let times = {};


					Object.each(value, function(cpu_value, cpu_key){

						if(cpu_key == 'times'){
							// debug_internals('cpu values %s %o', cpu_key, cpu_value);
							// throw new Error()

							Object.each(cpu_value, function(times_value, times_key){
								if(!times[times_key]) times[times_key] = {};

								let data_value = Object.values(times_value);//new format: timestamp->value

								let min = ss.min(data_value);
								let max = ss.max(data_value);

								times[times_key] = {
									samples: times_value,
									min : min,
									max : max,
									mean : ss.mean(data_value),
									median : ss.median(data_value),
									mode : ss.mode(data_value),
									range: max - min,
								};
							});
						}
						else{
							let data_value = Object.values(cpu_value);//new format: timestamp->value

							let min = ss.min(data_value);
							let max = ss.max(data_value);

							speed = {
								samples: cpu_value,
								min : min,
								max : max,
								mean : ss.mean(data_value),
								median : ss.median(data_value),
								mode : ss.mode(data_value),
								range: max - min,
							};
						}
					});


					////debug_internals('os-hour-stats filter speed %o', speed);

					new_doc['data'][key] = {
						//samples: value,
						speed: speed,
						times: times
					};
				}
				else{
					// debug_internals('hour value %o', value);
					// throw new Error()

					let data_value = Object.values(value);//new format: timestamp->value


					let min = ss.min(data_value);
					let max = ss.max(data_value);

					new_doc['data'][key] = {
						samples : value,
						min : min,
						max : max,
						mean : ss.mean(data_value),
						median : ss.median(data_value),
						mode : ss.mode(data_value),
						range: max - min,
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


			});

			debug_internals('os-hour-stats filter value %o', new_doc);

			//throw new Error();
			next(new_doc, opts, next, pipeline);
		});



	}

};
