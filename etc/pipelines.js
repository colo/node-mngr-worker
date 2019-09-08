const path = require('path')

const conn = require('./default.conn')()
const redis = require('./default.redis')
const bbb_conn = require('./bbb.conn.js')()
const frontail = require('./default.frontail')
const http_os = require('./http.os')
const munin = require('./munin')

const periodical_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat/filters/00_from_default_query_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat/filters/01_from_lasts_get_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat/filters/02_from_ranges_create_stats'))
]

module.exports = [
    //require('./local/munin.js'),

    //require(path.join(process.cwd(), 'apps/bbb/pipeline'))(bbb_conn),


    require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(frontail, SITE_URL, conn),

    require(path.join(process.cwd(), 'apps/os/pipeline'))(http_os, conn),

    require(path.join(process.cwd(), 'apps/munin/pipeline'))(munin, conn),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'logs'}),
        output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        filters: Array.clone(periodical_stats_filters),
        type: 'minute'
      }
    ),
    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'os'}),
        output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        filters: Array.clone(periodical_stats_filters),
        type: 'minute'
      }
    ),
    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'munin'}),
        output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        filters: Array.clone(periodical_stats_filters),
        type: 'minute'
      }
    ),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        filters: Array.clone(hour_stats_filters),
        type: 'hour'
      }
    ),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        filters: Array.clone(hour_stats_filters),
        type: 'hour'
      }
    ),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        filters: Array.clone(hour_stats_filters),
        type: 'hour'
      }
    ),



    /**
    require(path.join(process.cwd(), 'apps/ui/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/historical/minute/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/historical/hour/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/historical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/ui/pipeline'))(conn, redis),
    **/

    // require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),
]
