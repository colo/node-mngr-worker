const path = require('path')

const conn = require('../default.conn')()
const http_os = require('../http.os')

let pipelines = [
    require(path.join(process.cwd(), 'apps/vhosts/pipeline'))(http_os, conn),
    // require(path.join(process.cwd(), 'apps/vhosts/pipeline'))(Object.merge(Object.clone(http_os), { host: 'elk' }), conn),
]


module.exports = pipelines
