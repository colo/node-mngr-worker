const path = require('path')

const conn = require('../../../../default.conn')()

/**
* stat - changes
**/
const periodical_stats_filters_changes = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_create_stats'))
]


let pipelines = [
    require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            table: 'logs_historical',
            type: 'hour',
            // full_range: false,
            requests: {
              req : {
                'id': 'changes',
                query: {
                  // 'filter': [ { 'metadata': { 'path': 'logs.educativa' } } ]
                  'filter': [
                    "r.row('metadata').hasFields('domain')"
                  ]
                }
              }
            }
          }
        ),
        opts: {
          // suspended: false,
          group_index: 'metadata.domain'
        },
        output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        filters: Array.clone(periodical_stats_filters_changes),

      }
    ),
]

module.exports = pipelines
