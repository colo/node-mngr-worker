/**
 * recives an array of OS docs and does some statictics on freemem
 * 
 **/
module.exports = function(doc, opts, next){
						
	var ss = require('simple-statistics');
	
	debug_internals('first filter doc %o', doc);
	debug_internals('first filter length %o', doc.length);
	debug_internals('first filter->next %o', next);
	
	if(typeof(doc) == 'array' || doc instanceof Array || Array.isArray(doc)){
		let first = doc[0].doc.metadata.timestamp;
		let last = doc[doc.length - 1].doc.metadata.timestamp;
		let new_doc = {data: {}, metadata: {range: {start: null, end: null}}};
		
		var freemems = [];
		
		Array.each(doc, function(d){
			let data = d.doc.data;
			//console.log(d.doc.data.freemem);
			//next(format_doc(d.doc), opts);
			freemems.push(data.freemem);
		});
		
		new_doc['metadata'] = {
			range: {
				start: first,
				end: last
			}
		};
		new_doc['data']['samples'] = freemems;
		new_doc['data']['min'] = ss.min(freemems).toFixed(2);
		new_doc['data']['max'] = ss.max(freemems).toFixed(2);
		new_doc['data']['avg'] = ss.mean(freemems).toFixed(2);
		new_doc['data']['median'] = ss.median(freemems).toFixed(2);
		new_doc['data']['harmonic'] = ss.harmonicMean(freemems).toFixed(2);
		new_doc['data']['geometric'] = ss.geometricMean(freemems).toFixed(2);
		//new_doc['data']['variance'] = ss.variance(freemems).toFixed(2);
		new_doc['data']['median_ab_deviation'] = ss.medianAbsoluteDeviation(freemems).toFixed(2);
		
		
		next(new_doc, opts);
		
	}
	//else{
		//next(format_doc(doc, opts));
	//}
};
