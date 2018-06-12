'use stric'

const path = require('path');

var cron = require('node-cron');

var stats = {}
var tabular_stats = {}

// var current_os = {}
// var last_historical_minute = {}

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
        // //console.log('Array.isArray(stat[0].value)', stat[0].value)
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

var _dynamic_charts = {
  "cpus_simple": Object.merge(Object.clone(DefaultChart),{
    // name: 'os.cpus_simple',
    // name: function(vm, chart, sta){
    //   return vm.host+'_os.cpus_simple'
    // },
    match: /cpus/,
    watch: {
      merge: true,
      value: 'times',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // //console.log('transform: ', values)

        let transformed = []
        let prev = {idle: 0, total: 0, timestamp: 0 }
        Array.each(values, function(val, index){
          let transform = {timestamp: val.timestamp, value: { times: { usage: 0} } }
          let current = {idle: 0, total: 0, timestamp: val.timestamp }

          // if(index == 0){
          Object.each(val.value.times, function(stat, key){
            if(key == 'idle')
              current.idle += stat

              current.total += stat
          })


          let diff_time = current.timestamp - prev.timestamp
          let diff_total = current.total - prev.total;
          let diff_idle = current.idle - prev.idle;

          // //////console.log('transform: ', current, prev)

          //algorithm -> https://github.com/pcolby/scripts/blob/master/cpu.sh
          let percentage =  (diff_time * (diff_total - diff_idle) / diff_total ) / (diff_time * 0.01)

          if(percentage > 100){
            //console.log('cpu transform: ', diff_time, diff_total, diff_idle)
          }

          transform.value.times.usage = (percentage > 100) ? 100 : percentage


          prev = Object.clone(current)
          transformed.push(transform)
        })
        return transformed
      }
    },


  }),
  "loadavg": Object.merge(Object.clone(DefaultChart),{
    match: /.*os\.loadavg/,
    watch: {
      merge: true,
      // // exclude: /samples/,
      // exclude: /range|mode/,

      /**
      * returns  a bigger array (values.length * samples.length) and add each property
      */
      transform: function(values){
        //console.log('loadavg transform: ', values)


        let transformed = []

        // Array.each(values, function(val, index){
        //   // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
        //   // transformed.push(transform)
        //
        //   let last_sample = null
        //   let counter = 0
        //   Object.each(val.value.samples, function(sample, timestamp){
        //     let transform = {timestamp: timestamp * 1, value: {samples: sample}}
        //
        //     if(counter == Object.getLength(val.value.samples) -1)
        //       last_sample = sample
        //
        //     Object.each(val.value, function(data, property){
        //       if(property != 'samples')
        //         transform.value[property] = data
        //     })
        //
        //     transformed.push(transform)
        //     counter++
        //   })
        //
        //   let timestamp = val.timestamp
        //   let transform = {timestamp: timestamp * 1, value: {}}
        //
        //   Object.each(val.value, function(data, property){
        //     if(property != 'samples'){
        //       transform.value[property] = data
        //     }
        //     else{
        //       transform.value['samples'] = last_sample
        //     }
        //   })
        //   transformed.push(transform)
        // })
        //
        // // //console.log('transformed: ', transformed)
        // //
        // return transformed
        return values
      }
    },

  }),
  // "loadavg_minute": Object.merge(Object.clone(DefaultChart),{
  //   match: /minute\.loadavg.*/,
  //   watch: {
  //     // exclude: /samples/,
  //     exclude: /range|mode/,
  //
  //     /**
  //     * returns  a bigger array (values.length * samples.length) and add each property
  //     */
  //     transform: function(values){
  //       //console.log('loadavg_minute transform: ', values)
  //
  //
  //       let transformed = []
  //
  //       Array.each(values, function(val, index){
  //         // let transform = { timestamp: val.timestamp, value: (val.value / 1024) / 1024 }
  //         // transformed.push(transform)
  //
  //         let last_sample = null
  //         let counter = 0
  //         Object.each(val.value.samples, function(sample, timestamp){
  //           let transform = {timestamp: timestamp * 1, value: {samples: sample}}
  //
  //           if(counter == Object.getLength(val.value.samples) -1)
  //             last_sample = sample
  //
  //           Object.each(val.value, function(data, property){
  //             if(property != 'samples')
  //               transform.value[property] = data
  //           })
  //
  //           transformed.push(transform)
  //           counter++
  //         })
  //
  //         let timestamp = val.timestamp
  //         let transform = {timestamp: timestamp * 1, value: {}}
  //
  //         Object.each(val.value, function(data, property){
  //           if(property != 'samples'){
  //             transform.value[property] = data
  //           }
  //           else{
  //             transform.value['samples'] = last_sample
  //           }
  //         })
  //         transformed.push(transform)
  //       })
  //
  //       // //console.log('transformed: ', transformed)
  //       //
  //       return transformed
  //       // return values
  //     }
  //   },
  //
  // }),
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

        dynamic_charts = _get_dynamic_charts(name, _dynamic_charts)

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
      let chart_name = process_chart_name(chart, stat) || name

      if(chart.watch.merge != true){
        chart_name += '_'+index
      }

      if(chart.watch.merge != true || index == 0){//merge creates only once instance

        process_chart(
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
      let chart_name = process_chart_name(chart, stat) || name

      process_chart(chart, chart_name)
    }

  }
  else{

    // chart.label = this.process_chart_label(chart, name, stat) || name
    let chart_name = process_chart_name(chart, stat) || name

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

    // //console.log('update_chart_stat', name)
    // //console.log(tabular_stats.elk.os)

  }


}

var update_chart_stat = function(name, data, value){
  value = value || tabular_stats

  // //console.log('name', name.substring(name.indexOf('.')+ 1,  name.length))
  // //console.log('1 name', name)
  if(name.indexOf('.') > -1){
    let key = name.substring(0, name.indexOf('.'))
    name = name.substring(name.indexOf('.')+ 1,  name.length)
    // //console.log('2 name', name)
    if(!value[key])
      value[key] = {}

    value = update_chart_stat(name, data, value[key])
  }
  else{
    value[name] = data
  }

}

var _current_nested_array = function (current, watcher, name){

  let index = (name.substring(name.indexOf('_') +1 , name.length - 1)) * 1
  ////////////////console.log('generic_data_watcher isNanN', name, val, index)

  let val_current = []
  Array.each(current, function(item){
    // ////////////////console.log('CPU item', item)

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

  // ////////////////console.log('CPU new current', val_current)

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

process_chart_name = function (chart, stat){
  if(chart.name && typeOf(chart.name) == 'function') return chart.name(this, chart, stat)
  else if(chart.name) return chart.name
}
/**
* from mixin/chart.vue
**/


/**
* from mixins/dashboard.vue
**/
_get_dynamic_charts = function (name, dynamic_charts){
  let charts = {}

  Object.each(dynamic_charts, function(dynamic, key){
    let re = new RegExp(key, 'g')
    if((dynamic.match && dynamic.match.test(name) == true) || re.test(name)){
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

let buffers = []
let alerts = {
}

// let alerts = {
//   data: [
//     {
//       '%hosts': (value, payload) => {
//         console.log('host alert', value, payload)
//       }
//     },
//     {
//       '%hosts': [
//         {
//           '%host': (value, payload) => {
//             console.log('each host alert', value, payload)
//           }
//         }
//       ]
//     },
//     {
//       '%hosts': {
//         'os' : {
//           'loadavg': (value, payload) => {
//             console.log('loadavg alert', value, payload)
//           }
//         }
//       }
//     },
//     {
//       '%hosts': {
//         '%path': {
//           '%properties': [{
//             '%property':
//               (value, payload) => {
//                 console.log('%property alert', value, payload)
//               }
//
//           }]
//         }
//       }
//     },
//   ],
//   tabular: [
//     {
//       '%hosts': {
//         'os' : {
//           'loadavg': (value, payload) => {
//             console.log('tabular loadavg alert', value, payload)
//           }
//         }
//       }
//     }
//   ]
//
//
// }

let alerts_condensed = {


  'data[].%hosts': (value, payload) => {
    console.log('host alert', value, payload)
  },

  'data[].%hosts[].%host': (value, payload) => {
    console.log('each host alert', value, payload)
  },

  'data[].%hosts.os.loadavg': (value, payload) => {
    console.log('loadavg alert', value, payload)
  },


  'data[].%hosts.%path.%properties[].%property': (value, payload) => {
    console.log('%property alert', value, payload)
  },

  'tabular[].%hosts.os.loadavg': (value, payload) => {
    console.log('tabular loadavg alert', value, payload)
  }

}

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
     * code taken from os.stats.vue
     **/
		function(doc, opts, next, pipeline){
      let extracted = {}

      if(doc[0].doc.metadata.path != 'os.historical'){
        extracted = Object.clone(extract_data_os_doc(doc))
        if(!pipeline.inputs[1].conn_pollers[0].minute.hosts[extracted.host])
          pipeline.inputs[1].conn_pollers[0].minute.hosts[extracted.host] = 1

        // process_os_doc(doc, opts, next, pipeline)

      }
      else{
        extracted = Object.clone(extract_data_os_historical_doc(doc))
        extracted.path = extracted.path.replace('/', '.')

        /**
        * clean hosts property on each iteration, so we only search on current hosts availables
        **/
        Object.each(pipeline.inputs[1].conn_pollers[0].minute.hosts, function(value, host){
          delete pipeline.inputs[1].conn_pollers[0].minute.hosts[host]
        })

        // process_historical_minute_doc(doc, opts, next, pipeline)
      }

      Object.each(extracted.keys, function(data, key){
        if(!stats[extracted.host])
          stats[extracted.host] = {}

        if(!stats[extracted.host][extracted.path])
          stats[extracted.host][extracted.path] = {}

        stats[extracted.host][extracted.path][key] = data

      }.bind(this))

      initialize_all_charts(stats)



      Object.each(stats, function(host_data, host){
        Object.each(host_data, function(path_data, path){
          Object.each(path_data, function(data, key){
            let name = host+'.'+path+'.'+key
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
              //console.log('host.path.key', name)
              generic_data_watcher(data, charts[name], name)
            }
          })
        })
      })

      // console.log('process_os_doc alerts filter', stats )
      // console.log('process_os_doc alerts filter tabular_stats', tabular_stats )

      next({ data: Object.clone(stats), tabular: Object.clone(tabular_stats)},opts, next, pipeline)
    },
    function(doc, opts, next, pipeline){
      console.log('process_os_doc alerts filter', doc )
      let alerts = {}

      let parse_condensed_keys = function(condensed, value, alerts){


          let sub_key = condensed.substring(0, condensed.indexOf('.')).trim()
          condensed = condensed.replace(sub_key, '')
          let rest_key = condensed.substring(condensed.indexOf('.')+1, condensed.length).trim()
          // Array.each(arr_keys, function(arr_key, index){

          if(sub_key.length > 0){
            if(sub_key.indexOf('[') > -1){
              sub_key = sub_key.replace(/\[|\]/g,'')
              if(!alerts[sub_key])
                alerts[sub_key] = []
            }
            else{
              if(!alerts[sub_key])
                alerts[sub_key] = {}
            }

            console.log('rest_key', sub_key, rest_key)


            parse_condensed_keys(rest_key, value, alerts[sub_key])
          }
          else {
            // throw new Error()
            if(Array.isArray(alerts)){
              let tmp = {}
              tmp[rest_key] = value
              alerts.push( tmp )
              console.log('typeof', typeOf(alerts[0][rest_key]));
            }
            else{
              alerts[rest_key] = value

              console.log('typeof', typeOf(alerts[rest_key]));
            }

          }


      }

      Object.each(alerts_condensed, function(alert, condensed){
        parse_condensed_keys(condensed, alert, alerts)
      })


      console.log('alerts', alerts)

      let recurse_alerts = function(alerts, doc, name){

        if(Array.isArray(alerts)){
          Array.each(alerts, function(alert, index){
            recurse_alerts(alert, doc, name)
          })
        }
        else{//assume Object
          // let key = Object.keys(alerts)[0]
          Object.each(alerts, function(alert, key){
            if(key.indexOf('%') == 0){

              // if(key.lastIndexOf('%') > 0){
              //
              // }
              // else{
                if(typeof alert == 'function'){
                  let payload = {
                    property: name
                  }
                  alert(doc, payload)
                }
                else{
                  Object.each(doc, function(data, doc_key){
                    let sub_name = (name) ? name +'.'+doc_key : doc_key
                    recurse_alerts(alert, data, sub_name)
                  })
                }

            }
            else{
              if(doc[key] && typeof alert == 'function'){
                let payload = {
                  property: name+'.'+key
                }

                alert(doc[key], payload)
              }
              else if (doc[key]) {
                let sub_name = (name) ? name+'.'+key : key
                recurse_alerts(alerts[key], doc[key], sub_name)
              }
            }

          })

        }
      }

      recurse_alerts(alerts, doc, null)
    },
    /**
    * code taken from os.stats.vue
    **/
    // process_os_doc = function(doc, opts, next, pipeline){
    //   let {keys, path, host} = extract_data_os_doc(doc)
    //
    //   if(!pipeline.inputs[1].conn_pollers[0].minute.hosts[host])
    //     pipeline.inputs[1].conn_pollers[0].minute.hosts[host] = 1
    //
    //   Object.each(keys, function(data, key){
    //     if(!stats[host])
    //       stats[host] = {}
    //
    //     if(!stats[host][path])
    //       stats[host][path] = {}
    //
    //     stats[host][path][key] = data
    //
    //   }.bind(this))
    //
    //   //console.log('process_os_doc alerts filter', stats.elk.os.cpus[0] )
    //
    //
    //   initialize_all_charts(stats)
    //
    //   //console.log('process_os_doc alerts filter', charts )
    //
    //   Object.each(stats, function(host_data, host){
    //     Object.each(host_data, function(path_data, path){
    //       Object.each(path_data, function(data, key){
    //         let name = host+'.'+path+'.'+key
    //         if(
    //           (
    //             ( dynamic_blacklist
    //             && dynamic_blacklist.test(name) == false )
    //           || ( dynamic_whitelist
    //             && dynamic_whitelist.test(name) == true )
    //           )
    //           && (
    //             !static_charts
    //             || Object.keys(static_charts).contains(name) == false
    //           )
    //         ){
    //           //console.log('host.path.key', name)
    //           generic_data_watcher(data, charts[name], name)
    //         }
    //       })
    //     })
    //   })
    //
    //
    //   // //console.log('process_os_doc alerts filter', charts )
    //
    //   // sanitize(doc[0], opts, pipeline.outputs[0], pipeline)
    //   // output[0](doc)
    // },
    // process_historical_minute_doc = function(doc, opts, next, pipeline){
    //   let {keys, path, host} = extract_data_os_historical_doc(doc)
    //   path = path.replace('/', '.')
    //
    //   Object.each(keys, function(data, key){
    //     if(!stats[host])
    //       stats[host] = {}
    //
    //     if(!stats[host][path])
    //       stats[host][path] = {}
    //
    //     stats[host][path][key] = data
    //
    //   }.bind(this))
    //
    //   //console.log('process_historical_minute_doc alerts filter', stats.elk['os.minute'].loadavg)
    //
    //
    //   initialize_all_charts(stats)
    //   // //console.log('process_historical_minute_doc alerts filter', charts)
    //
    //
    //   Object.each(stats, function(host_data, host){
    //     Object.each(host_data, function(path_data, path){
    //       Object.each(path_data, function(data, key){
    //         let name = host+'.'+path+'.'+key
    //         if(
    //           (
    //             ( dynamic_blacklist
    //             && dynamic_blacklist.test(name) == false )
    //           || ( dynamic_whitelist
    //             && dynamic_whitelist.test(name) == true )
    //           )
    //           && (
    //             !static_charts
    //             || Object.keys(static_charts).contains(name) == false
    //           )
    //         ){
    //           // //console.log('host.path.key', name)
    //           generic_data_watcher(data, charts[name], name)
    //         }
    //       })
    //     })
    //   })
    //
    //
    //   /**
    //   * clean hosts property on each iteration, so we only search on current hosts availables
    //   **/
    //   Object.each(pipeline.inputs[1].conn_pollers[0].minute.hosts, function(value, host){
    //     delete pipeline.inputs[1].conn_pollers[0].minute.hosts[host]
    //   })
    //
    // },
    sanitize = require('./snippets/filter.sanitize.template'),
	],
	output: [
    function(doc){
      // //console.log('os alerts output',doc.metadata, JSON.decode(doc))
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
