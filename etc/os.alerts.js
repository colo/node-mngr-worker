'use stric'

const path = require('path');

var cron = require('node-cron');

var stats = {}
var tabular_stats = {}

/**
* from os.stats.vue
**/
var extract_data_os_historical = require(path.join(process.cwd(), 'apps/os/alerts/node_modules/node-mngr-docs/')).extract_data_os_historical

var extract_data_os = require(path.join(process.cwd(), 'apps/os/alerts/node_modules/node-mngr-docs/')).extract_data_os


/**
* from os.stats.vue
**/

/**
* from os.dashboard.vue
**/

var static_charts = require(path.join(process.cwd(), 'apps/os/alerts/conf/static.tabular'))

var DefaultChart = require(path.join(process.cwd(), 'apps/os/alerts/conf/default.tabular'))
var _dynamic_charts = require(path.join(process.cwd(), 'apps/os/alerts/conf/dynamic.tabular')).rules
var dynamic_blacklist = require(path.join(process.cwd(), 'apps/os/alerts/conf/dynamic.tabular')).blacklist
var dynamic_whitelist = require(path.join(process.cwd(), 'apps/os/alerts/conf/dynamic.tabular')).whitelist


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
/**
* modifies global obj charts
**/
var process_chart = function (chart, name){
  if(chart.init && typeOf(chart.init) == 'function')
    chart.init(this, chart, 'chart')

  // this.create_watcher(name, chart)
  charts[name] = chart
}

generic_data_watcher  = require(path.join(process.cwd(), 'apps/os/alerts/node_modules/node-tabular-data/')).data_to_tabular

/**
* ex-update_chart_stat -> update_tabular_stat
**/
var update_tabular_stat = function(name, data, value){
  value = value || tabular_stats

  if(name.indexOf('.') > -1){
    let key = name.substring(0, name.indexOf('.'))
    name = name.substring(name.indexOf('.')+ 1,  name.length)

    if(!value[key])
      value[key] = {}

    update_tabular_stat(name, data, value[key])
  }
  else{
    value[name] = data
  }

}

var _current_nested_array = require(path.join(process.cwd(), 'apps/os/alerts/node_modules/node-tabular-data/')).nested_array_to_tabular

var _current_number_to_data = require(path.join(process.cwd(), 'apps/os/alerts/node_modules/node-tabular-data/')).number_to_tabular

var _current_array_to_data = require(path.join(process.cwd(), 'apps/os/alerts/node_modules/node-tabular-data/')).array_to_tabular

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
_get_dynamic_charts = require(path.join(process.cwd(), 'apps/os/alerts/node_modules/node-tabular-data/')).get_dynamics

/**
* from mixins/dashboard.vue
**/

// let buffers = []
// let alerts = {
// }

let expanded_alerts = require(path.join(process.cwd(), 'apps/os/alerts/conf/expanded'))

let condensed_alerts = require(path.join(process.cwd(), 'apps/os/alerts/conf/condensed'))

var alerts_payloads = {}

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
        extracted = Object.clone(extract_data_os(doc))
        if(!pipeline.inputs[1].conn_pollers[0].minute.hosts[extracted.host])
          pipeline.inputs[1].conn_pollers[0].minute.hosts[extracted.host] = 1

        // process_os_doc(doc, opts, next, pipeline)

      }
      else{
        extracted = Object.clone(extract_data_os_historical(doc))
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
              generic_data_watcher(data, charts[name], name, update_tabular_stat)
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

      let _alerts = {data: [], tabular: []}

      let parse_condensed_keys = function(condensed, value, alerts){

          let sub_key = condensed.substring(0, condensed.indexOf('.')).trim()
          sub_key = sub_key.replace(/\/|_|-/g, '.')

          condensed = condensed.replace(sub_key, '')
          let rest_key = condensed.substring(condensed.indexOf('.')+1, condensed.length).trim()
          // rest_key = rest_key.replace('_', '.')

          // Array.each(arr_keys, function(arr_key, index){

          if(sub_key.length > 0){
            let sub_alert = undefined
            let recurse_alert = undefined

            if(sub_key.indexOf('[') > -1){
              sub_key = sub_key.replace(/\[|\]/g,'')
              // if(!alerts[sub_key])
                sub_alert = []
            }
            else{
              // if(!alerts[sub_key])
                sub_alert = {}
            }

            if(Array.isArray(alerts)){
              let tmp = {}
              tmp[sub_key] = sub_alert
              alerts.push( tmp )//change sub_key to array index
              recurse_alert = alerts[alerts.length - 1][sub_key]
            }
            else{

              if(!alerts[sub_key]){
                alerts[sub_key] = sub_alert
                // let tmp = {}
                // tmp[sub_key] = sub_alert

                // alerts[sub_key] = Object.merge(alerts[sub_key], sub_alert)
              }
              // else{
              //
              // }

              recurse_alert = alerts[sub_key]
            }

            // console.log('rest_key', sub_key, rest_key, recurse_alert)

            parse_condensed_keys(rest_key, value, recurse_alert)
          }
          else {
            // throw new Error()
            if(Array.isArray(alerts)){
              let tmp = {}
              tmp[rest_key] = value
              alerts.push( tmp )
            }
            else{
              if(value.$payload){
                let new_payload = {}

                if(value.$payload.$extra){
                  let key = Object.keys(value.$payload.$extra)[0]

                  parse_condensed_keys(key, value.$payload.$extra[key], new_payload)


                  // value.$payload = Object.merge(value.$payload, new_payload)

                  // Object.each(value.$payload, function(data, key){
                  //   if(key != '$extra')
                  //     new_payload[key] = data
                  // })
                  //
                  console.log('NEW PAYLOAD', new_payload)

                  value.$payload.$extra = new_payload
                }
                else{
                  let key = Object.keys(value.$payload)[0]
                  new_payload = {}
                  parse_condensed_keys(key, value.$payload[key], new_payload)
                  value.$payload = new_payload
                }

                // console.log('extras??', rest_key, value, new_payload)

              }

              alerts[rest_key] = value

            }

          }

      }

      Object.each(condensed_alerts, function(alert, condensed){
        parse_condensed_keys(condensed, alert, _alerts)
      })

      let all_alerts = {data: [], tabular: []}
      all_alerts.data = all_alerts.data.append(expanded_alerts.data).append(_alerts.data)
      all_alerts.tabular = all_alerts.tabular.append(expanded_alerts.tabular).append(_alerts.tabular)
      // // Object.merge(expanded_alerts, _alerts)

      // console.log('ALL alerts', all_alerts.data[0]['%hosts'].os.loadavg['$payload'])

      let original_doc = doc//needed to recurse $payload

      let recurse_alerts = function(alerts, doc, name){
        let result
        if(Array.isArray(alerts)){
          result = []
          Array.each(alerts, function(alert, index){
            result.push ( recurse_alerts(alert, doc, name) )
          })
        }
        else{//assume Object
          // let key = Object.keys(alerts)[0]

          Object.each(alerts, function(alert, key){

            if(key.indexOf('%') == 0){

                if(typeof alert == 'function'){
                  let payload = {
                    property: name
                  }
                  result = alert.attempt([doc, payload])
                }
                else{
                  result = []
                  Object.each(doc, function(data, doc_key){
                    let sub_name = (name) ? name +'.'+doc_key : doc_key
                    result.push ( recurse_alerts(alert, data, sub_name) )
                  })
                }

            }
            else{

              if(
                doc[key]
                && (
                  typeof alert == 'function'
                  || (alert.$callback && typeof alert.$callback == 'function')
                )
              ){
                // console.log('ALL alerts', key, alert)

                let fn
                if(alert.$callback){
                  fn = alert.$callback
                }
                else{
                  fn = alert
                }

                let payload = {}

                if(alert.$payload){
                  // let value
                  if(alert.$payload.$extra){

                    alert.$payload.extra = recurse_alerts(alert.$payload.$extra, original_doc, null)
                    payload = Object.clone(alert.$payload)
                    payload.property = name+'.'+key

                    let alert_payload = {}
                    if(alerts_payloads[fn.toString()+'.'+payload.property])
                      alert_payload = Object.clone(alerts_payloads[fn.toString()+'.'+payload.property])

                    Object.each(alert_payload, function(value, prop){
                      if(prop != 'extra' && prop != '$extra' && prop != 'property')
                        payload[prop] = value
                    })


                  }
                  else{
                    payload['extra'] = recurse_alerts(alert.$payload, original_doc, null)
                    payload.property = name+'.'+key
                  }



                  // value = recurse_alerts(alert.$payload, original_doc, null)
                  // console.log('alert.$payload', alerts_payloads)
                  // payload['extra'] = value
                }
                else{
                  payload.property = name+'.'+key
                }

                result = fn.attempt([doc[key], payload])

                if(alert.$payload && alert.$payload.$extra){
                  alerts_payloads[fn.toString()+'.'+payload.property] = Object.clone(payload)
                }

              }
              else if (doc[key]) {
                let sub_name = (name) ? name+'.'+key : key
                result = recurse_alerts(alerts[key], doc[key], sub_name)
              }
            }

          })

        }


        return result
      }

      recurse_alerts(all_alerts, doc, null)
      // recurse_alerts(expanded_alerts, doc, null)
      // recurse_alerts(_alerts, doc, null)
    },

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
