module.exports = {
    default: 'never',
    maxAge: [
        {
            domain: /(localhost|127.0.0.1)/i,
            rules: [
                {
                    regex: /.*/,
                    maxAge: 10,
                    ignoreQuery: true
                }
            ]
        }
    ],
    never: [],
    always: []
};
