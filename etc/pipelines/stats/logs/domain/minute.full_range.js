const path = require('path')

const conn = require('../../../../default.conn')()

/**
* stat - full range
**/
const periodical_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_once_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]


let pipelines = [


  /**
  * Logs Stats (full_range)
  **/
  require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    {
      input: Object.merge(
        Object.clone(conn), {
          index: 'path',
          table: 'logs',
          type: 'minute',
          full_range: true,
          requests: {
            req : {
              'id': 'once',
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
        group_index: 'metadata.domain'
      },
      output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
      filters: Array.clone(periodical_stats_filters_full_range),

    }
  ),

]


module.exports = pipelines
