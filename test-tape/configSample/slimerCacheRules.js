module.exports = {
    default: 'never',
    maxAge: [
        {
            domain: /.*/,
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
