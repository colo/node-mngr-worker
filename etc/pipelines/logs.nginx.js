const path = require('path')

const conn = require('../default.conn')()

let pipelines = [

  /**
  * Logs
  **/
  // require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(
  //   path.join(process.cwd(), 'devel/var/log/nginx/www.educativa.com-access.log'),
  //   'www.educativa.com',
  //   conn
  // ),


]


/**
* load all access log from dir (production)
**/

const glob = require('glob')
const os = require('os')
const DIR = path.join(process.cwd(), 'devel/var/log/nginx/')
// const DIR = '/var/log/nginx/'

const files = glob.sync('*access.log', {
  'cwd': DIR
})

Array.each(files, function(file){
  /**
  * Logs
  **/

  let domain = file.replace('-access.log', '')
  domain = domain.replace('access.log', '')
  domain = (domain === '') ? os.hostname() : domain

  pipelines.push(
    require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(
      path.join(DIR, file),
      domain,
      conn
    )
  )
})

module.exports = pipelines
