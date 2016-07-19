module.exports.$CacheFactoryProvider = function() {

    var caches = {};

    this.getCaches = function() {
        return caches;
    };

    this.export = function(cacheId) {
        if (typeof cache[cacheId] === 'undefined') {
            throw new Error('$cacheFactory - iid - CacheId '+cacheId+' is not defined!');
        }
        return caches[cacheId].export();
    };

    this.exportAll = function() {
        var _caches = {};
        for(var i in caches) {
            _caches[i] = caches[i].export();
        }
        return _caches;
    };

    this.remove = function(cacheId) {
        if (typeof caches[cacheId] !== 'undefined') {
            delete caches[cacheId];
        }
    };


    this.removeAll = function() {
        caches = {};
    };

    this.importAll = function(cacheData) {

        var cacheFactory = this.$get();
        for(var i in cacheData) {
            if(typeof caches[i] === 'undefined') {
                caches[i] = cacheFactory(i);
            }
            caches[i].import(cacheData[i]);
        }
    };

    this.import = function(cacheId, cacheData) {

        var cacheFactory = this.$get();
        if(typeof caches[cacheId] === 'undefined') {
            caches[cacheId] = cacheFactory(i);
        }

        caches[cacheId].import(cacheData);
    };

    this.info = function(cacheId) {
        if(typeof caches[cacheId] === 'undefined') {
            throw new Error('$cacheFactory - iid - CacheId '+cacheId+' is not defined!');
        }
        return caches[cacheId].info();
    };

    this.infoAll = function() {
        var info = {};
        for (var cacheId  in caches) {
            info[cacheId] = caches[cacheId].info();
        }
        return info;
    };

    this.$get = function() {


        function cacheFactory(cacheId, options) {
            if (cacheId in caches) {
                return caches[cacheId];
                throw new Error('$cacheFactory - iid - CacheId '+cacheId+' is already taken!');
            }

            var size = 0,
                stats = Object.assign({}, options, {id: cacheId}),
                data = Object.create(null),
                capacity = (options && options.capacity) || Number.MAX_VALUE,
                lruHash = Object.create(null),
                freshEnd = null,
                staleEnd = null;


            return caches[cacheId] = {

                put: function(key, value) {
                    if ( typeof value === 'undefined') return;
                    if (capacity < Number.MAX_VALUE) {
                        var lruEntry = lruHash[key] || (lruHash[key] = {key: key});
                        refresh(lruEntry);
                    }

                    if (!(key in data)) size++;
                    data[key] = value;

                    if (size > capacity) {
                        this.remove(staleEnd.key);
                    }

                    return value;
                },

                export: function() {
                    return data;
                },

                import: function(data) {
                    size = 0;
                    lruHash = Object.create(null);
                    freshEnd = null;
                    staleEnd = null;
                    for(var i in data) {
                        this.put(i, data[i]);
                    }
                },

                get: function(key) {
                    if (capacity < Number.MAX_VALUE) {
                        var lruEntry = lruHash[key];

                        if (!lruEntry) return;

                        refresh(lruEntry);
                    }

                    return data[key];
                },

                remove: function(key) {
                    if (capacity < Number.MAX_VALUE) {
                        var lruEntry = lruHash[key];

                        if (!lruEntry) return;

                        if (lruEntry === freshEnd) freshEnd = lruEntry.p;
                        if (lruEntry === staleEnd) staleEnd = lruEntry.n;
                        link(lruEntry.n,lruEntry.p);

                        delete lruHash[key];
                    }

                    if (!(key in data)) return;

                    delete data[key];
                    size--;
                },

                removeAll: function() {
                    data = Object.create(null);
                    size = 0;
                    lruHash = Object.create(null);
                    freshEnd = staleEnd = null;
                },

                destroy: function() {
                    data = null;
                    stats = null;
                    lruHash = null;
                    delete caches[cacheId];
                },

                info: function() {
                    return Object.assign({}, stats, {size: size});
                },

                keys: function() {
                    return Object.getOwnPropertyNames(data);
                }
            };

            /**
             * makes the `entry` the freshEnd of the LRU linked list
             */
            function refresh(entry) {
                if (entry !== freshEnd) {
                    if (!staleEnd) {
                        staleEnd = entry;
                    } else if (staleEnd === entry) {
                        staleEnd = entry.n;
                    }

                    link(entry.n, entry.p);
                    link(entry, freshEnd);
                    freshEnd = entry;
                    freshEnd.n = null;
                }
            }

            /**
             * bidirectionally links two entries of the LRU linked list
             */
            function link(nextEntry, prevEntry) {
                if (nextEntry !== prevEntry) {
                    if (nextEntry) nextEntry.p = prevEntry; //p stands for previous, 'prev' didn't minify
                    if (prevEntry) prevEntry.n = nextEntry; //n stands for next, 'next' didn't minify
                }
            }
        }

        cacheFactory.info = function() {
            var info = {};
            for (var cacheId  in caches) {
                info[cacheId] = caches[cacheId].info();
            }
            return info;
        };

        return cacheFactory;
    };
}

module.exports.$TemplateCacheProvider = function() {
    this.$get = ['$cacheFactory', function($cacheFactory) {
        return $cacheFactory('templates');
    }];
}
