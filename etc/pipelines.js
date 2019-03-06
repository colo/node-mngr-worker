const path = require('path')

let conn = require('./default.conn.js')()

module.exports = [
    //require('./local/munin.js'),
    //
    require(path.join(process.cwd(), 'apps/os/pipeline')),
    require(path.join(process.cwd(), 'apps/munin/pipeline'))(conn),


    require(path.join(process.cwd(), 'apps/historical/minute/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/historical/hour/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/ui/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/historical/pipeline'))(conn),


    // require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),
]
