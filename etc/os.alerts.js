'use stric'

const path = require('path');

var cron = require('node-cron');

var current_os = {}
var last_historical_minute = {}

/**
* from os.stats.vue
**/
var extract_data_os_historical_doc = function (doc){
  let type = ''
  let range = {}
  if(Array.isArray(doc)){
    type = doc[0].doc.metadata.type
    range = doc[0].doc.metadata.range
  }
  else{
    type = doc.metadata.type
    range = doc.metadata.range
  }

  // let {keys, path, host} = this.extract_data_os_doc(doc)
  let {keys, path, host} = extract_data_os_doc(doc)
  path = path.replace('historical', type)

  Object.each(keys, function(data, key){
    if(Array.isArray(data)){
      Array.each(data, function(value, index){
        data[index].range = range
      })
    }
    else{
      data.range = range
    }
  })

  return {keys: keys, path: path, host: host}
}

var extract_data_os_doc = function(doc){
  let keys = {}
  let path = ''
  let host = ''

  if(Array.isArray(doc)){
    Object.each(doc[0].doc.data, function(data, key){
      keys[key] = []
    })

    path = doc[0].doc.metadata.path.replace(/\./g, '/')
    host = doc[0].doc.metadata.host

    Array.each(doc, function(item){
      Object.each(item.doc.data, function(value, key){
        let data = {value: value, timestamp: item.doc.metadata.timestamp}
        if(keys[key])
          keys[key].push(data)
      })
    }.bind(this))
  }
  else {
    Object.each(doc.data, function(data, key){
      keys[key] = null
    })
    path = doc.metadata.path.replace(/\./g, '/')
    host = doc.metadata.host

    Object.each(doc.data, function(value, key){
      let data = {value: value, timestamp: doc.metadata.timestamp}
      keys[key] = data
    })
  }
  return {keys: keys, path: path, host: host}
}

/**
* from os.stats.vue
**/

/**
* from os.dashboard.vue
**/
var static_charts = {}
var dynamic_charts = {}
var dynamic_blacklist = /totalmem/ //don't add charts automatically for this os[key]
var dynamic_whitelist = null
// defaukt.dygraph.line.js
var DefaultChart = {
    // init: function (vue){
    // },
    pre_process: function(chart, name, stat){


      if(!chart.options || !chart.options.labels){
        if(!chart.options)
          chart.options = {}

        chart.options.labels = []

        /**
        * dynamic, like 'cpus', that is an Array (multiple cores) of Objects and we wanna watch a specific value
        * cpus[0].value[N].times[idle|irq...]
        */
        if(Array.isArray(stat[0].value)
          && chart.watch && chart.watch.value
          && stat[0].value[0][chart.watch.value]
        ){
          // console.log('Array.isArray(stat[0].value)', stat[0].value)
          Object.each(stat[0].value[0][chart.watch.value], function(tmp, tmp_key){
            chart.options.labels.push(tmp_key)
          })

          chart.options.labels.unshift('Time')

        }
        /**
        * dynamic, like 'blockdevices', that is an Object and we wanna watch a specific value
        * stat[N].value.stats[in_flight|io_ticks...]
        */
        else if(isNaN(stat[0].value) && !Array.isArray(stat[0].value)){//an Object

          //if no "watch.value" property, everything should be manage on "trasnform" function
          if(
            chart.watch && chart.watch.managed != true
            || !chart.watch

            // && chart.watch.value
          ){
            let obj = {}
            if(chart.watch && chart.watch.value){
              obj = stat[0].value[chart.watch.value]
            }
            else{
              obj = stat[0].value
            }
            Object.each(obj, function(tmp, tmp_key){
              if(
                !chart.watch
                || !chart.watch.exclude
                || (chart.watch.exclude && chart.watch.exclude.test(tmp_key) == false)
              )
                chart.options.labels.push(tmp_key)
            })

            chart.options.labels.unshift('Time')
          }

        }
        //simple, like 'loadavg', that has 3 columns
        else if(Array.isArray(stat[0].value)){

          chart.options.labels = ['Time']

          for(let i= 0; i < stat[0].value.length; i++){//create data columns
            chart.options.labels.push(name+'_'+i)
          }


          // this.process_chart(chart, name)
        }
        //simple, like 'uptime', that has one simple Numeric value
        else if(!isNaN(stat[0].value)){//
          chart.options.labels = ['Time']

          chart.options.labels.push(name)
          // this.process_chart(chart, name)
        }

        else{
          chart = null
        }
      }

      return chart
    },
    "options": {}
  }

var initialize_all_charts = function(val){
  Object.each(val, function(stat, key){
    parse_chart_from_stat(stat, key)
  }.bind(this))

  Object.each(static_charts, function(chart, name){
    process_chart(chart, name)
  }.bind(this))
}

/**
* from mixin/chart.vue
**/
var parse_chart_from_stat = function (stat, name){

  /**
  * create chart automatically if it's not blacklisted or is whitelisted
  **/
  if(
    (
      ( dynamic_blacklist
      && dynamic_blacklist.test(name) == false )
    || ( dynamic_whitelist
      && dynamic_whitelist.test(name) == true )
    )
    && (
      !static_charts
      || Object.keys(static_charts).contains(name) == false
    )
  ){

    if(Array.isArray(stat)){//it's stat

        dynamic_charts = _get_dynamic_charts(name, dynamic_charts)

        if(dynamic_charts[name]){

          Array.each(dynamic_charts[name], function(dynamic){

            process_dynamic_chart(Object.clone(dynamic), name, stat)

          }.bind(this))
        }
        else{

          let chart = Object.clone(DefaultChart)

          process_chart(
            chart.pre_process(chart, name, stat),
            name
          )

        }


    }
    else{//blockdevices.[key]
      Object.each(stat, function(data, key){
        parse_chart_from_stat(data, name+'.'+key)
      }.bind(this))

    }

  }
}

var process_dynamic_chart = function (chart, name, stat){

  if(Array.isArray(stat[0].value)){//like 'cpus'

    Array.each(stat[0].value, function(val, index){

      let arr_chart = Object.clone(chart)

      // arr_chart.label = this.process_chart_label(chart, name, stat) || name
      // let chart_name = this.process_chart_name(chart, stat) || name

      if(chart.watch.merge != true){
        chart_name += '_'+index
      }

      if(chart.watch.merge != true || index == 0){//merge creates only once instance

        this.process_chart(
          arr_chart.pre_process(arr_chart, chart_name, stat),
          chart_name
        )

      }

    }.bind(this))

  }
  else if(isNaN(stat[0].value)){
    //sdX.stats.

    let filtered = false
    if(chart.watch && chart.watch.filters){
      Array.each(chart.watch.filters, function(filter){
        let prop_to_filter = Object.keys(filter)[0]
        let value_to_filter = filter[prop_to_filter]

        if(
          stat[0].value[prop_to_filter]
          && value_to_filter.test(stat[0].value[prop_to_filter]) == true
        ){
          filtered = true
        }

      })
    }
    else{
      filtered = true
    }

    if(filtered == true){

      chart = chart.pre_process(chart, name, stat)

      // chart.label = this.process_chart_label(chart, name, stat) || name
      // let chart_name = this.process_chart_name(chart, stat) || name

      process_chart(chart, chart_name)
    }

  }
  else{

    // chart.label = this.process_chart_label(chart, name, stat) || name
    // let chart_name = this.process_chart_name(chart, stat) || name

    process_chart(
      chart.pre_process(chart, chart_name, stat),
      name
    )
  }

}

var charts = {}
var process_chart = function (chart, name){
  if(chart.init && typeOf(chart.init) == 'function')
    chart.init(this, chart, 'chart')

  // this.create_watcher(name, chart)
  charts[name] = chart
}

generic_data_watcher  = function(current, chart, name){
  let watcher = chart.watch || {}

  if(watcher.managed == true){
    watcher.transform(current, this, chart)
  }
  else{
    let type_value = null
    let value_length = 0
    if(watcher.value != ''){
      type_value = (Array.isArray(current[0].value) && current[0].value[0][watcher.value]) ? current[0].value[0][watcher.value] : current[0].value[watcher.value]
    }
    else{
      type_value = current[0].value
    }

    let data = []

    if(Array.isArray(type_value)){//multiple values, ex: loadavg
      if(watcher.exclude){
        Array.each(current, function(data){
          Object.each(data.value, function(value, key){
            if(watcher.exclude.test(key) == true)
              delete data.value[key]
          })
        })
      }

      if(typeOf(watcher.transform) == 'function'){
        current = watcher.transform(current, this, chart)
      }

      data = _current_array_to_data(current, watcher)
    }
    else if(isNaN(type_value) || watcher.value != ''){

      if(Array.isArray(current[0].value) && current[0].value[0][watcher.value]){//cpus
        current = _current_nested_array(current, watcher, name)
      }

      // else{//blockdevices.sdX
      if(watcher.exclude){
        Array.each(current, function(data){
          Object.each(data.value, function(value, key){
            if(watcher.exclude.test(key) == true)
              delete data.value[key]
          })
        })
      }


      if(typeOf(watcher.transform) == 'function'){
        current = watcher.transform(current, this, chart)
      }

      if(!Array.isArray(current))
        current = [current]

      data = _current_array_to_data(current, watcher)

    }
    else{//single value, ex: uptime

      if(typeOf(watcher.transform) == 'function'){
        current = watcher.transform(current, this, chart)
      }

      data = _current_number_to_data (current, watcher)


    }

    update_chart_stat(name, data)

  }


}

var _current_nested_array = function (current, watcher, name){

  let index = (name.substring(name.indexOf('_') +1 , name.length - 1)) * 1
  //////////////console.log('generic_data_watcher isNanN', name, val, index)

  let val_current = []
  Array.each(current, function(item){
    // //////////////console.log('CPU item', item)

    let value = {}
    Array.each(item.value, function(val, value_index){//each cpu

      if(watcher.merge !== true && value_index == index){////no merging - compare indexes to add to this watcher
        value[watcher.value] = Object.clone(val[watcher.value])
      }
      else{//merge all into a single stat
        if(value_index == 0){
          value[watcher.value] = Object.clone(val[watcher.value])
        }
        else{
          Object.each(val[watcher.value], function(prop, key){
            value[watcher.value][key] += prop
          })

        }
      }

    }.bind(this))

    val_current.push({timestamp: item.timestamp, value: value})

  }.bind(this))

  // //////////////console.log('CPU new current', val_current)

  return val_current
}

var _current_number_to_data  = function(current, watcher){
  let data = []
  Array.each(current, function(current){
    let value = null
    if(watcher.value != ''){
      value = current.value[watcher.value]
    }
    else{
      value = current.value
    }

    // data.push([new Date(current.timestamp), value, 0])//0, minute column
    data.push([new Date(current.timestamp), value])//0, minute column
  })

  return data
}

var _current_array_to_data = function (current, watcher){
  watcher = watcher || {value: ''}
  watcher.value = watcher.value || ''

  let data = []
  Array.each(current, function(item){
    let tmp_data = []
    tmp_data.push(new Date(item.timestamp))

    let value = null
    if(watcher.value != ''){
      value = item.value[watcher.value]
    }
    else{
      value = item.value
    }

    // Array.each(value, function(real_value){
    //   tmp_data.push(real_value)
    // })
    if(Array.isArray(value)){
      Array.each(value, function(real_value){
        tmp_data.push(real_value)
      })
    }
    else if(!isNaN(value)){//mounts[mount_point].value.percentage
      tmp_data.push(value * 1)
    }
    else{
      Object.each(value, function(real_value){
        real_value = real_value * 1
        tmp_data.push(real_value)
      })
    }

    // tmp_data.push(0)//add minute column

    data.push(tmp_data)
  })

  return data
}

/**
* from mixin/chart.vue
**/


/**
* from mixins/dashboard.vue
**/
_get_dynamic_charts = function (name, dynamic_charts){
  let charts = {}
  Object.each(dynamic_charts, function(dynamic){
    if(dynamic.match.test(name) == true){
      if(!charts[name])
        charts[name] = []

      charts[name].push(dynamic)

    }
  }.bind(this))

  return charts
}
/**
* from mixins/dashboard.vue
**/

module.exports = {
 input: [
  {
    poll: {
      id: "input.os.alerts.cradle",
      conn: [
        {
          scheme: 'cradle',
          host:'elk',
          //host:'127.0.0.1',
          port: 5984 ,
          db: 'dashboard',
          module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/cradle')),
          load: ['apps/os/alerts/current']
        }
      ],
      requests: {
        /**
         * runnign at 20 secs intervals
         * needs 3 runs to start analyzing from last historical (or from begining)
         * it takes 60 secs to complete, so it makes historical each minute
         * @use node-cron to start on 0,20,40....or it would start messuring on a random timestamp
         * */
        // periodical: function(dispatch){
        // 	return cron.schedule('19,39,59 * * * * *', dispatch);//every 20 secs
        // }
        periodical: 1000,
        //periodical: 2000,//test
      },

    },
  },
  {
   poll: {
     id: "input.os.alerts.minute.cradle",
     conn: [
       {
         scheme: 'cradle',
         host:'elk',
         //host:'127.0.0.1',
         port: 5984 ,
         db: 'dashboard',
         module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/cradle')),
         load: ['apps/os/alerts/minute']
       }
     ],
     requests: {
       /**
        * runnign at 20 secs intervals
        * needs 3 runs to start analyzing from last historical (or from begining)
        * it takes 60 secs to complete, so it makes historical each minute
        * @use node-cron to start on 0,20,40....or it would start messuring on a random timestamp
        * */
       // periodical: function(dispatch){
       // 	return cron.schedule('19,39,59 * * * * *', dispatch);//every 20 secs
       // }
       // periodical: 20000,
       //periodical: 2000,//test
     },

   },
  },
 ],
 filters: [
		/**
    * just send each doc to its corresponding filter
    */
		function(doc, opts, next, pipeline){
      // console.log('os alerts filter', )

      if(doc[0].doc.metadata.path != 'os.historical'){

        process_os_doc(doc, opts, next, pipeline)

      }
      else{
        process_historical_minute_doc(doc, opts, next, pipeline)
      }


      // if(opts.type == 'once' &&  Object.getLength(doc) == 0)//empty os.alerts, create default ones
      //   next(
      //     {
      //       data: {},
      //       // metadata: {
      //       //   path: 'os.alerts',
      //       //   timestamp: Date.now()
      //       // }
      //     },
      //     opts,
      //     next
      //   )

    },
    /**
    * code taken from os.stats.vue
    */
    process_os_doc = function(doc, opts, next, pipeline){
      let {keys, path, host} = extract_data_os_doc(doc)

      if(!pipeline.inputs[1].conn_pollers[0].minute.hosts[host])
        pipeline.inputs[1].conn_pollers[0].minute.hosts[host] = 1

      Object.each(keys, function(data, key){
        if(!current_os[host])
          current_os[host] = {}

        if(!current_os[host][path])
          current_os[host][path] = {}

        current_os[host][path][key] = data

      }.bind(this))

      initialize_all_charts(current_os)

      // Object.each(current_os, function(value, host){
      //   initialize_all_charts(current_os[host])
      // })

      // console.log('process_os_doc alerts filter', current_os.elk.loadavg.value )
      console.log('process_os_doc alerts filter', charts )

      // sanitize(doc[0], opts, pipeline.outputs[0], pipeline)
      // output[0](doc)
    },
    process_historical_minute_doc = function(doc, opts, next, pipeline){
      let {keys, path, host} = extract_data_os_historical_doc(doc)
      path = path.replace('/', '.')
      
      Object.each(keys, function(data, key){
        if(!last_historical_minute[host])
          last_historical_minute[host] = {}

        if(!last_historical_minute[host][path])
          last_historical_minute[host][path] = {}

        last_historical_minute[host][path][key] = data

      }.bind(this))

      initialize_all_charts(last_historical_minute)
      // console.log('process_historical_minute_doc alerts filter', charts)
      // console.log('process_historical_minute_doc alerts filter', last_historical_minute.elk.loadavg.value)

      /**
      * clean hosts property on each iteration, so we only search on current hosts availables
      **/
      Object.each(pipeline.inputs[1].conn_pollers[0].minute.hosts, function(value, host){
        delete pipeline.inputs[1].conn_pollers[0].minute.hosts[host]
      })

    },
    sanitize = require('./snippets/filter.sanitize.template'),
	],
	output: [
    function(doc){
      // console.log('os alerts output',doc.metadata, JSON.decode(doc))
    },
    //require('./snippets/output.stdout.template'),
    // {
    // 	cradle: {
    // 		id: "output.os.alerts.cradle",
    // 		conn: [
    // 			{
    // 				//host: '127.0.0.1',
    // 				host: 'elk',
    // 				port: 5984,
    // 				db: 'dashboard',
    // 				opts: {
    // 					cache: true,
    // 					raw: false,
    // 					forceSave: true,
    // 				}
    // 			},
    // 		],
    // 		module: require(path.join(process.cwd(), 'lib/pipeline/output/cradle')),
    // 		buffer:{
    // 			size: 0,
    // 			expire:0
    // 		}
    // 	}
    // }
  ]
}
