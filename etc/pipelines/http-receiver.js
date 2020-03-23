const path = require('path')

const conn = require('../default.conn')()
const http_receiver = require('../http.receiver')


let pipelines = [

    /**
    * OS
    **/
    require(path.join(process.cwd(), 'apps/http-receiver/pipeline'))(http_receiver, conn),
    // require(path.join(process.cwd(), 'apps/os/pipeline'))(Object.merge(Object.clone(http_os), { host: 'elk' }), conn),
    //

]


module.exports = pipelines
