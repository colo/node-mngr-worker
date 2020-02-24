const path = require('path')

const conn = require('../default.conn')()
const http_os = require('../http.os')


let pipelines = [

    /**
    * OS
    **/
    require(path.join(process.cwd(), 'apps/os/pipeline'))(http_os, conn),
    // require(path.join(process.cwd(), 'apps/os/pipeline'))(Object.merge(Object.clone(http_os), { host: 'elk' }), conn),
    //

]


module.exports = pipelines
