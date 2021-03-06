const path = require('path')

// const conn = require('../../../../default.conn')()
const conn = require('../../../../servers/carina.conn')()

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
          table: 'logs',
          type: 'minute',
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
                // "this.r.row('metadata').hasFields('domain')"
                "this.r.row('metadata').hasFields('domain').and(this.r.row('metadata')('path').eq('logs.educativa'))"
              ],
              opts: {includeTypes: true, squash: 1}//, maxBatchSeconds: 1
            }
          }
          // }
        }
      ),
      opts: {
        group_index: 'metadata.host'
      },
      output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
      filters: Array.clone(stats_filters),

    }

  ),

]


module.exports = pipelines


// let pipelines = [
//
//
//   /**
//   * Logs Stats (changes)
//   **/
//
//   require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
//     {
//       input: Object.merge(
//         Object.clone(conn), {
//           table: 'logs',
//           type: 'minute',
//           // full_range: false,
//           requests: {
//             req : {
//               'id': 'changes',
//               query: {
//                 opts: {includeTypes: true, squash: 1}//, maxBatchSeconds: 1
//               }
//             }
//           }
//
//         }
//       ),
//       opts: {
//         suspended: false,
//       },
//       output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
//       filters: Array.clone(stats_filters),
//
//     }
//   ),
// ]
//
//
// module.exports = pipelines
