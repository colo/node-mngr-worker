const path = require('path')

const conn = require('../default.conn')()

/**
* stat - changes
**/
const periodical_stats_filters_changes = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_create_stats'))
]


let pipelines = [

    /**
    * OS Stats (changes)
    **/
    require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            table: 'os',
            type: 'minute',
            // full_range: false,
            requests: {
              req : {
                'id': 'changes',
              }
            }

          }
        ),
        output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        filters: Array.clone(periodical_stats_filters_changes),

      }
    ),
]

module.exports = pipelines
