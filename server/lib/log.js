/**
 * Created by antoine on 26/02/16.
 */
/**
 *
 * @param config {AngularServerConfig}
 * @param type strinf
 */
module.exports =  function(config, type) {

    var log = bunyan.createLogger(
        {
            name: config.name + '.' + type,
            streams: [
                {
                    level: 'info',
                    stream:  path.join(config.path.log, type + '-info.log' )
                },
                {
                    level: 'error',
                    src: true,
                    path: path.join(config.path.log, type + '-error.log' )
                },
                {
                    level: 'debug',
                    path: path.join(config.path.log, type + '-debug.log' )
                },
                {
                    level: 'warn',
                    src: true,
                    path: path.join(config.path.log, type + '-warn.log' )
                }
            ],
            serializers: bunyan.stdSerializers
        }
    );

    log.log = function() {
        return log.debug(arguments);
    };

    return log;
};