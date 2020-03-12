const path = require('path')

const conn = require('../default.conn')()

const minute_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_periodical_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]


let pipelines = [


  /**
  * Logs Stats (periodical)
  **/
  require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    {
      input: Object.merge(
        Object.clone(conn), {
          table: 'munin',
          type: 'minute',
          full_range: false,
          requests: {
            req : {
              // query: {
              //   index: 'path',
              // },
              'id': 'periodical',
            }
          }
        }
      ),
      output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
      filters: Array.clone(minute_stats_filters),

    }

  ),

]


module.exports = pipelines
