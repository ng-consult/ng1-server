module.exports = {
    default: 'never',
    maxAge: [
        {
            domain: /.*/,
            rules: [
                {
                    regex: /.*/,
                    maxAge: 20,
                    ignoreQuery: true
                }
            ]
        }
    ],
    never: [],
    always: []
};
