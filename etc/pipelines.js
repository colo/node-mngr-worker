const path = require('path')

let conn = require('./default.conn.js')()


module.exports = [
    //require('./local/munin.js'),
    //
    require(path.join(process.cwd(), 'apps/os/info/pipeline')),

    require(path.join(process.cwd(), 'apps/os/historical/minute/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/os/historical/hour/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/munin/pipeline'))(conn),

    //
    // // require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),
    //
    require(path.join(process.cwd(), 'apps/os/purge/periodical/pipeline')),
    // // require(path.join(process.cwd(), 'apps/os/purge/historical/pipeline')),
]
