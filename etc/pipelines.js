const path = require('path')

module.exports = [
    //require('./local/munin.js'),
    //
    require(path.join(process.cwd(), 'apps/os/info/pipeline')),

    require(path.join(process.cwd(), 'apps/os/historical/minute/pipeline')),
    require(path.join(process.cwd(), 'apps/os/historical/hour/pipeline')),

    require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),
    //
    require(path.join(process.cwd(), 'apps/os/purge/live/pipeline')),
    require(path.join(process.cwd(), 'apps/os/purge/historical/pipeline')),
]
