const path = require('path')

const conn = require('../default.conn')()
const munin = require('../munin')


let pipelines = [

    /**
    * Munin
    **/
    require(path.join(process.cwd(), 'apps/os/pipeline'))(munin, conn),
    // require(path.join(process.cwd(), 'apps/os/pipeline'))(Object.merge(Object.clone(http_os), { host: 'elk' }), conn),
    //

]


module.exports = pipelines
