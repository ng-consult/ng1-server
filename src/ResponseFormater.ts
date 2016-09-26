
export const ResponseStatus = {
    RENDERED: 'RENDERED',
    RENDER_EXCLUDED: 'RENDER_EXCLUDED',
    ALREADY_CACHED: 'ALREADY_CACHED',
    SERVER_TIMEOUT: 'SERVER_TIMEOUT',
    ERROR_HANDLER: 'ERROR_HANDLER',
    SERVER_ERROR: 'SERVER_ERROR',
    JSDOM_ERROR: 'JSDOM_ERROR',
    JSDOM_URL_ERROR: 'JSDOM_URL_ERROR'
};

const ResponseCodes  = {
    RENDERED: 0,
    RENDER_EXCLUDED: 1,
    ALREADY_CACHED: 2,
    SERVER_TIMEOUT: 3,
    ERROR_HANDLER: 4,
    SERVER_ERROR: 5,
    JSDOM_ERROR: 6,
    JSDOM_URL_ERROR: 7
}; 

export class Response {

    static send = (html: string, status: string, Exception?: Error) => {

        if(typeof ResponseCodes[status] === 'undefined') {
            throw new Error('This status doesn\'t exist ' + status);
        }

        let trace = null;
        if (ResponseCodes[status].stacktrace) {
            if(typeof Exception === 'Error') {
                trace = Error['stack'];
            } else {
                trace = new Error().stack;
            }
        }

        return {
            html: html,
            code: ResponseCodes[status],
            status: status,
            trace: trace
        };

    }
}


