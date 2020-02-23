const path = require('path')

const conn = require('./default.conn')()
const redis = require('./default.redis')
const bbb_conn = require('./bbb.conn.js')()
const frontail = require('./default.frontail')
const http_os = require('./http.os')
const munin = require('./munin')
const telegram = require('./telegram')
const http_ui = require('./http.ui')

/**
* data format
**/
// const periodical_data_format_filters_changes = [
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
//   // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_data_format'))
// ]

/**
* ML tests
**/
// const periodical_training_filters_carrot = [
//   // require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
//   // require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_build_lasts')),
//   // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_train-carrot'))
// ]
//
// const periodical_training_filters_changes = [
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_train-written_docs-os_stats'))
// ]


/**
* stat - changes
**/
const periodical_stats_filters_changes = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_create_stats'))
]


/**
* stat
**/
const periodical_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]
const hour_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]
const day_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_day_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]
/**
* stat - full range
**/
const periodical_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

const hour_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

const day_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_day_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

/**
* purge
**/
const periodical_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_hour')),
]

const minute_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_day')),
]

let pipelines = [

  /**
  * Logs
  **/
  // require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(
  //   path.join(process.cwd(), 'devel/var/log/nginx/www.educativa.com-access.log'),
  //   'www.educativa.com',
  //   conn
  // ),

  /**
  * Logs Stats (changes)
  **/

  // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
  //   {
  //     input: Object.merge(
  //       Object.clone(conn), {
  //         table: 'logs',
  //         type: 'minute',
  //         // full_range: false,
  //         requests: {
  //           req : {
  //             'id': 'changes',
  //           }
  //         }
  //
  //       }
  //     ),
  //     opts: { suspended: false },
  //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     filters: Array.clone(periodical_stats_filters_changes),
  //
  //   }
  // ),


  // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
  //   {
  //     input: Object.merge(
  //       Object.clone(conn), {
  //         table: 'logs_historical',
  //         type: 'hour',
  //         // full_range: false,
  //         requests: {
  //           req : {
  //             'id': 'changes',
  //           }
  //         }
  //       }
  //     ),
  //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     filters: Array.clone(periodical_stats_filters_changes),
  //
  //   }
  // ),

  /**
  * Logs Stats (full_range)
  **/
  // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
  //   {
  //     input: Object.merge(
  //       Object.clone(conn), {
  //         index: 'path',
  //         table: 'logs',
  //         type: 'minute',
  //         full_range: true,
  //         requests: {
  //           req : {
  //             'id': 'once',
  //           }
  //         }
  //
  //       }
  //     ),
  //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     filters: Array.clone(periodical_stats_filters_full_range),
  //
  //   }
  // ),

  // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
  //   {
  //     input: Object.merge(
  //       Object.clone(conn), {
  //         index: 'path',
  //         table: 'logs_historical',
  //         type: 'hour',
  //         full_range: true,
  //         requests: {
  //           req : {
  //             'id': 'once',
  //             // query: {
  //             //   distinct: {
  //             //     domains: "('metadata')('domain')"
  //             //   }
  //             // }
  //           }
  //         }
  //
  //       }
  //     ),
  //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     filters: Array.clone(hour_stats_filters_full_range),
  //
  //   }
  // ),

  // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
  //   {
  //     input: Object.merge(
  //       Object.clone(conn), {
  //         index: 'path',
  //         table: 'logs_historical',
  //         type: 'day',
  //         full_range: true,
  //         requests: {
  //           req : {
  //             'id': 'once',
  //             // query: {
  //             //   distinct: {
  //             //     domains: "('metadata')('domain')"
  //             //   }
  //             // }
  //           }
  //         }
  //
  //       }
  //     ),
  //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     filters: Array.clone(day_stats_filters_full_range),
  //
  //   }
  // ),

  /**
  * Logs Stats (periodical)
  **/

  // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
  //   {
  //     input: Object.merge(Object.clone(conn), {table: 'logs'}),
  //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     filters: Array.clone(periodical_stats_filters),
  //     type: 'minute',
  //     full_range: false
  //   }
  // ),
  // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
  //   {
  //     input: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     filters: Array.clone(hour_stats_filters),
  //     type: 'hour',
  //     full_range: false
  //   }
  // ),


  /**
  * Logs Purge - periodicals
  **/

  // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
  //   {
  //     input: Object.merge(
  //       Object.clone(conn), {
  //         table: 'logs',
  //         type: 'periodical',
  //         // // full_range: false,
  //         // requests: {
  //         //   req : {
  //         //     'id': 'changes',
  //         //   }
  //         // }
  //
  //       }
  //     ),
  //     output: Object.merge(Object.clone(conn), {table: 'logs'}),
  //     filters: Array.clone(periodical_purge_filters),
  //     // type: 'periodical'
  //   }
  // ),

  /**
  * Logs Purge - minute
  **/
  // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
  //   {
  //     input: Object.merge(
  //       Object.clone(conn), {
  //         table: 'logs_historical',
  //         type: 'minute',
  //         // // full_range: false,
  //         // requests: {
  //         //   req : {
  //         //     'id': 'changes',
  //         //   }
  //         // }
  //
  //       }
  //     ),
  //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
  //     filters: Array.clone(minute_purge_filters),
  //     // type: 'minute'
  //   }
  // ),
    /**
    * BrainJS
    **/
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(
    //       Object.clone(conn),
    //       {
    //         table: 'os',
    //         type: 'minute',
    //         full_range: false,
    //         requests: {
    //           req : {
    //             'id': 'changes',
    //             'index': false,
    //             'filter': [
    //               { 'metadata': { 'host': 'elk' } },
    //               "this.r.row('metadata')('path').eq('os.cpus')" +
    //               ".or(this.r.row('metadata')('path').eq('os.blockdevices.vda3.time'))" +
    //               ".or(this.r.row('metadata')('path').eq('os.blockdevices.vda3.sectors'))" +
    //               ".or(this.r.row('metadata')('path').eq('os.rethinkdb.server.written_docs'))" +
    //               ".or(this.r.row('metadata')('path').eq('os.rethinkdb.server.read_docs'))"
    //             ]
    //           }
    //         }
    //       }
    //     ),
    //     output: Object.merge(Object.clone(conn), {table: 'ml'}),
    //     filters: Array.clone(periodical_training_filters_changes),
    //
    //
    //   }//
    // ),

    /**
    * Carrot
    **/
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(
    //       Object.clone(conn),
    //       {
    //         table: 'os',
    //         type: 'hour',
    //         full_range: false,
    //         requests: {
    //           req : {
    //             'id': 'periodical',
    //             'index': false,
    //             query: {
    //               'q': [
    //                 'data',
    //                 { 'metadata': ['path', 'timestamp', 'host'] }
    //               ],
    //               'transformation': [
    //                 {
    //                   'orderBy': { 'index': 'r.desc(timestamp)' }
    //                 }
    //               ],
    //               'filter': [
    //                 { 'metadata': { 'host': 'elk' } },
    //                 "this.r.row('metadata')('path').eq('os.cpus')" +
    //                 ".or(this.r.row('metadata')('path').eq('os.blockdevices.vda3.time'))" +
    //                 ".or(this.r.row('metadata')('path').eq('os.blockdevices.vda3.sectors'))" +
    //                 ".or(this.r.row('metadata')('path').eq('os.rethinkdb.server.written_docs'))" +
    //                 ".or(this.r.row('metadata')('path').eq('os.rethinkdb.server.read_docs'))"
    //               ]
    //             }
    //
    //           }
    //         }
    //       }
    //     ),
    //     output: Object.merge(Object.clone(conn), {table: 'ml'}),
    //     filters: Array.clone(periodical_training_filters_carrot),
    //
    //
    //   }//
    // ),

    /**
    * OS
    **/
    // require(path.join(process.cwd(), 'apps/os/pipeline'))(http_os, conn),
    // require(path.join(process.cwd(), 'apps/os/pipeline'))(Object.merge(Object.clone(http_os), { host: 'elk' }), conn),
    //
    /**
    * OS Rethinkdb stats
    **/
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {
    //       db: 'rethinkdb',
    //       table: 'stats',
    //       // format: 'tabular'
    //       full_range: false,
    //       requests: {
    //         req : {
    //           'id': 'changes',
    //           query: {
    //             "filter": [
    //           		// "r.row('id').eq(['server', '6e7e0e21-0468-4946-accd-315aa92aa70b'])"
    //               "r.row('id').eq(['server', '50ce6db5-22da-4bff-87ac-987e51a38b3f'])"
    //               // "r.row('server').eq('elk_75k')"
    //
    //           	],
    //           }
    //         }
    //       }
    //     }),
    //     output: Object.merge(Object.clone(conn), {table: 'os'}),
    //     filters: Array.clone([require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_rethinkdb'))]),
    //   }
    // ),

    /**
    * OS Stats (changes)
    **/
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(
    //       Object.clone(conn), {
    //         table: 'os',
    //         type: 'minute',
    //         // full_range: false,
    //         requests: {
    //           req : {
    //             'id': 'changes',
    //           }
    //         }
    //
    //       }
    //     ),
    //     output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     filters: Array.clone(periodical_stats_filters_changes),
    //
    //   }
    // ),
    //
    //
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(
    //       Object.clone(conn), {
    //         table: 'os_historical',
    //         type: 'hour',
    //         // full_range: false,
    //         requests: {
    //           req : {
    //             'id': 'changes',
    //           }
    //         }
    //       }
    //     ),
    //     output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     filters: Array.clone(periodical_stats_filters_changes),
    //
    //   }
    // ),

    /**
    * OS Stats
    **/
    require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            table: 'os_historical',
            type: 'day',
            full_range: false,
            requests: {
              req : {
                // index: false,
                'id': 'paths',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        filters: Array.clone(day_stats_filters),

      }
      // {
      //   input: Object.merge(Object.clone(conn), {table: 'os'}),
      //   output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
      //   filters: Array.clone(periodical_stats_filters),
      //   type: 'day',
      //   full_range: false
      // }
    ),
    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     filters: Array.clone(hour_stats_filters),
    //     type: 'hour',
    //     full_range: false
    //   }
    // ),

    /**
    * OS Purge
    **/
    // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os'}),
    //     filters: Array.clone(periodical_purge_filters),
    //     type: 'periodical'
    //   }
    // ),
    //
    // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     filters: Array.clone(minute_purge_filters),
    //     type: 'minute'
    //   }
    // ),

    /**
    * OS tabular
    **/
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os_tabular'}),
    //     filters: Array.clone(periodical_data_format_filters_changes),
    //     type: 'inmediate',
    //     opts: { format: 'tabular' }
    //     // full_range: false
    //   }
    // ),
    //
    // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os_tabular'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os_tabular'}),
    //     filters: Array.clone(periodical_purge_filters),
    //     type: 'periodical'
    //   }
    // ),



    /**
    * Munin
    **/

    // require(path.join(process.cwd(), 'apps/munin/pipeline'))(munin, conn),
    //
    // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'munin'}),
    //     output: Object.merge(Object.clone(conn), {table: 'munin'}),
    //     filters: Array.clone(periodical_purge_filters),
    //     type: 'periodical'
    //   }
    // ),
    //
    // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     filters: Array.clone(minute_purge_filters),
    //     type: 'minute'
    //   }
    // ),


    /**
    * Munin stats
    **/

    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(
    //       Object.clone(conn), {
    //         table: 'munin',
    //         type: 'minute',
    //         // full_range: false,
    //         requests: {
    //           req : {
    //             'id': 'changes',
    //           }
    //         }
    //
    //       }
    //     ),
    //     output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     filters: Array.clone(periodical_stats_filters_changes),
    //     type: 'minute',
    //   }
    // ),
    //
    //
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(
    //       Object.clone(conn), {
    //         table: 'munin',
    //         type: 'minute',
    //         // full_range: false,
    //         requests: {
    //           req : {
    //             'id': 'changes',
    //           }
    //         }
    //
    //       }
    //     ),
    //     output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     filters: Array.clone(periodical_stats_filters_changes),
    //     type: 'hour',
    //   }
    // ),


    //require(path.join(process.cwd(), 'apps/bbb/pipeline'))(bbb_conn),

    // require(path.join(process.cwd(), 'apps/vhosts/pipeline'))(http_os, conn),
    // require(path.join(process.cwd(), 'apps/vhosts/pipeline'))(Object.merge(Object.clone(http_os), { host: 'elk' }), conn),
    //

    // require(path.join(process.cwd(), 'apps/educativa/checks/vhosts/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'vhosts'}),
    //     output: Object.merge(Object.clone(conn), {table: 'educativa'}),
    //     // filters: Array.clone(periodical_stats_filters_full_range),
    //     // type: 'minute'
    //   }
    // ),

    // require(path.join(process.cwd(), 'apps/educativa/alerts/vhosts/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'educativa'}),
    //     output: Object.merge(Object.clone(conn), {table: 'educativa'}),
    //     // filters: Array.clone(periodical_stats_filters_full_range),
    //     // type: 'minute'
    //   }
    // ),
    //
    // require(path.join(process.cwd(), 'apps/educativa/purge/all/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'educativa'}),
    //     output: Object.merge(Object.clone(conn), {table: 'educativa'}),
    //     // filters: Array.clone([
    //     //   require(path.join(process.cwd(), 'apps/educativa/purge/filters/00_from_default_query_delete_until_last_hour')),
    //     // ]),
    //     // type: 'check'
    //   }
    // ),

    // require(path.join(process.cwd(), 'apps/notify/alerts/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'educativa'}),
    //     output: telegram,
    //     // filters: Array.clone(periodical_stats_filters_full_range),
    //     // type: 'minute'
    //   }
    // ),



    // require(path.join(process.cwd(), 'apps/ui/pipeline'))(http_ui),







    /**
    * stats
    **/

    /**
    * live
    **/
    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     filters: Array.clone(periodical_stats_filters),
    //     type: 'minute',
    //     full_range: false
    //   }
    // ),
    //
    /**
    * replaced with stat-changes (bettwr performance)
    *
    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'munin'}),
        output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        filters: Array.clone(periodical_stats_filters),
        type: 'minute',
        full_range: false
      }
    ),
    **/



    //
    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     filters: Array.clone(hour_stats_filters),
    //     type: 'hour',
    //     full_range: false
    //   }
    // ),
    //
    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     filters: Array.clone(hour_stats_filters),
    //     type: 'hour',
    //     full_range: false
    //   }
    // ),




    /**
    * full range
    **/
    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     filters: Array.clone(periodical_stats_filters_full_range),
    //     type: 'minute',
    //     full_range: true
    //   }
    // ),
    //
    //
    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'munin'}),
    //     output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     filters: Array.clone(periodical_stats_filters_full_range),
    //     type: 'minute',
    //     full_range: true
    //   }
    // ),

    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
    //     filters: Array.clone(hour_stats_filters_full_range),
    //     type: 'hour',
    //     full_range: true
    //   }
    // ),
    //
    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
    //     filters: Array.clone(hour_stats_filters_full_range),
    //     type: 'hour',
    //     full_range: true
    //   }
    // ),
    //



    /**require(path.join(process.cwd(), 'apps/ui/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/historical/minute/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/historical/hour/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/historical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/ui/pipeline'))(conn, redis),**/


    // require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),
]

/**
* load all access log from dir (production)
**/

const glob = require('glob')
const os = require('os')
// const DIR = path.join(process.cwd(), 'devel/var/log/nginx/')
const DIR = '/var/log/nginx/'

const files = glob.sync('*access.log', {
  'cwd': DIR
})

// console.log(files)
// process.exit(1)

Array.each(files, function(file){
  /**
  * Logs
  **/

  let domain = file.replace('-access.log', '')
  domain = domain.replace('access.log', '')
  domain = (domain === '') ? os.hostname() : domain
  // console.log(domain)
  // process.exit(1)

  pipelines.push(
    require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(
      path.join(DIR, file),
      domain,
      conn
    )
  )
})

module.exports = pipelines
