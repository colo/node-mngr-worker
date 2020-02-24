const path = require('path')

const conn = require('../default.conn')()

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
    * OS Purge
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            table: 'os',
            type: 'periodical',
            // // full_range: false,
            // requests: {
            //   req : {
            //     'id': 'changes',
            //   }
            // }

          }
        ),
        output: Object.merge(Object.clone(conn), {table: 'os'}),
        filters: Array.clone(periodical_purge_filters),
        // type: 'periodical'
      }
    ),

    /**
    * OS Purge - minute
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            table: 'os_historical',
            type: 'minute',
            // // full_range: false,
            // requests: {
            //   req : {
            //     'id': 'changes',
            //   }
            // }

          }
        ),
        output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        filters: Array.clone(minute_purge_filters),
        // type: 'minute'
      }
    ),

]


module.exports = pipelines
