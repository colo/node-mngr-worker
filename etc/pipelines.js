const path = require('path')

module.exports = [
    //require('./local/munin.js'),
    // require('./info.os'),
    //require('./os.historical.minute'),
    // ////require('./os.historical.fix'),
    //require('./os.historical.hour'),
    //require('./os.purge'),
    // require('./config.alerts'),
    require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),
]
