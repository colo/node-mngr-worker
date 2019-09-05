const path = require('path')

const conn = require('./default.conn')()
const redis = require('./default.redis')
const bbb_conn = require('./bbb.conn.js')()
const frontail = require('./default.frontail')
const http_os = require('./http.os')
const munin = require('./munin')

module.exports = [
    //require('./local/munin.js'),

    //require(path.join(process.cwd(), 'apps/bbb/pipeline'))(bbb_conn),


    require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(frontail, SITE_URL, conn),

    require(path.join(process.cwd(), 'apps/os/pipeline'))(http_os, conn),

    require(path.join(process.cwd(), 'apps/munin/pipeline'))(munin, conn),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))({input: Object.merge(Object.clone(conn), {table: 'logs'}), output: Object.merge(Object.clone(conn), {table: 'logs_historical'})}),
    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))({input: Object.merge(Object.clone(conn), {table: 'os'}), output: Object.merge(Object.clone(conn), {table: 'os_historical'})}),
    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))({input: Object.merge(Object.clone(conn), {table: 'munin'}), output: Object.merge(Object.clone(conn), {table: 'munin_historical'})}),



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
