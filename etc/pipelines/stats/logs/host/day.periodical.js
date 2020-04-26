const path = require('path')

const conn = require('../../../../default.conn')()

const day_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_periodical_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_day_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

let pipelines = [

    require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            table: 'logs_historical',
            type: 'day',
            full_range: false,
            requests: {
              req : {
                // query: {
                //   index: 'path',
                // },
                'id': 'periodical',
                query: {
                  // 'filter': [ { 'metadata': { 'path': 'logs.educativa' } } ]
                  'filter': [
                    "this.r.row('metadata')('host').ne('*')"
                  ]
                }
              }
            }
          }
        ),
        output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        filters: Array.clone(day_stats_filters),

      }

    ),

]

module.exports = pipelines
