const path = require('path')

const conn = require('./default.conn')()
const redis = require('./default.redis')
const bbb_conn = require('./bbb.conn.js')()
const frontail = require('./default.frontail')
const http_os = require('./http.os')
const munin = require('./munin')
const telegram = require('./telegram')
const http_ui = require('./http.ui')

const periodical_training_filters_carrot = [
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_build_lasts')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_train-carrot'))
]

const periodical_training_filters_changes = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_train-written_docs-os_stats'))
]

const periodical_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

const periodical_stats_filters_changes = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_create_stats'))
]

const periodical_data_format_filters_changes = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_data_format'))
]


const periodical_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

const hour_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

const hour_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_default_query_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

const periodical_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_hour')),
]

const minute_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_day')),
]

module.exports = [

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
    //               // "r.row('id').eq(['server', 'a8235e33-42cb-41ab-ab30-683640810d86'])"
    //               "r.row('server').eq('elk')"
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
    * OS Stats
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





    // require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(
    //   path.join(process.cwd(), 'devel/var/log/nginx/www.educativa.com-access.log'),
    //   'www.educativa.com',
    //   conn
    // ),


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


    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'logs'}),
    //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
    //     filters: Array.clone(periodical_stats_filters),
    //     type: 'minute',
    //     full_range: false
    //   }
    // ),
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
    //     input: Object.merge(Object.clone(conn), {table: 'logs'}),
    //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
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
    // require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
    //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
    //     filters: Array.clone(hour_stats_filters_full_range),
    //     type: 'hour',
    //     full_range: true
    //   }
    // ),

    /**
    * Purge - periodicals
    **/

    // // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
    // //   {
    // //     input: Object.merge(Object.clone(conn), {table: 'logs'}),
    // //     output: Object.merge(Object.clone(conn), {table: 'logs'}),
    // //     filters: Array.clone(periodical_purge_filters),
    // //     type: 'periodical'
    // //   }
    // // ),

    /**
    * Purge - minute
    **/
    // // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
    // //   {
    // //     input: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
    // //     output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
    // //     filters: Array.clone(minute_purge_filters),
    // //     type: 'minute'
    // //   }
    // // ),

    /**require(path.join(process.cwd(), 'apps/ui/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/historical/minute/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/historical/hour/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/historical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/ui/pipeline'))(conn, redis),**/


    // require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),
]
