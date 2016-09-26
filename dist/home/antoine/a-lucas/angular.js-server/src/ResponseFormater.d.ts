export declare const ResponseStatus: {
    RENDERED: string;
    RENDER_EXCLUDED: string;
    ALREADY_CACHED: string;
    SERVER_TIMEOUT: string;
    ERROR_HANDLER: string;
    SERVER_ERROR: string;
    JSDOM_ERROR: string;
    JSDOM_URL_ERROR: string;
};
export declare class Response {
    static send: (html: string, status: string, Exception?: Error) => {
        html: string;
        code: any;
        status: string;
        trace: any;
    };
}
