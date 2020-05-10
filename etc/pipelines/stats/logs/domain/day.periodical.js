const path = require('path')

const conn = require('../../../../default.conn')()


/**
* stat - changes
**/
const stats_filters = [
  require(path.join(process.cwd(), 'apps/stats/filters/00_from_changes_build_buffer')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stats/filters/02_from_buffer_create_stats'))
]


let pipelines = [


  /**
  * Logs Stats (periodical)
  **/
  // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
  require(path.join(process.cwd(), 'apps/stats/pipeline'))(
    {
      input: Object.merge(
        Object.clone(conn), {
          module: require(path.join(process.cwd(), 'apps/stats/input/rethinkdb')),
          table: 'logs_historical',
          type: 'day',
          full_range: false,
          // requests: {
          once: {
            'id': 'changes',
            query: {
              'register': 'changes',
              'index': false,
              'q': [
                "data",
                "metadata"
              ],
              // 'aggregation': 'distinct',
              'filter': [
                "this.r.row('metadata').hasFields('tag').and(this.r.row('metadata')('tag').contains('domain').and( this.r.row('metadata')('path').eq('logs.educativa')))"
              ],
              opts: {includeTypes: true, squash: 1}//, maxBatchSeconds: 1
            }
          }
          // }
        }
      ),
      opts: {
        group_index: 'metadata.domain'
      },
      output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
      filters: Array.clone(stats_filters),

    }

  ),

]


module.exports = pipelines

// const day_stats_filters = [
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_periodical_build_lasts')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_day_historical_ranges')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
// ]
//
// let pipelines = [
//
//     require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
//       {
//         input: Object.merge(
//           Object.clone(conn), {
//             table: 'logs_historical',
//             type: 'day',
//             full_range: false,
//             requests: {
//               req : {
//                 // query: {
//                 //   index: 'path',
//                 // },
//                 'id': 'periodical',
//                 query: {
//                   // 'filter': [ { 'metadata': { 'path': 'logs.educativa' } } ]
//                   'filter': [
//                     "r.row('metadata').hasFields('domain')"
//                   ]
//                 }
//               }
//             }
//           }
//         ),
//         opts: {
//           group_index: 'metadata.domain'
//         },
//         output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
//         filters: Array.clone(day_stats_filters),
//
//       }
//
//     ),
//
// ]
//
// module.exports = pipelines
