const webpage = require('webpage');

interface ISlimerSockets {
    [name: string]: SlimerSocket
}

interface pendingClient {
    name: string,
    url: string,
    token: string,
    callback: Function
}

interface ISocketEvent {
    name: string,
    event: string,
    data: any
}

export class SlimerIO {
    private page;
    private initialized:boolean = false;
    private pendingClients: pendingClient[] = [];
    private slimerSockets: ISlimerSockets = {};

    constructor(url:string) {
        this.initializePage(url);
    }

    public createSocket(name:string, url:string, token:string, callback:Function) {
        if (this.initialized) {
            this.slimerSockets[name] = new SlimerSocket(name, url, token, this.page);
            callback(this.slimerSockets[name]);
        } else {
            this.pendingClients.push({
                name: name,
                url: url,
                token: token,
                callback: callback
            });
        }
    }

    private initializePage(url: string) {
        //console.log('initializing slimer-socket.io');
        //console.log(getHTML(url));
        this.page = webpage.create();

        this.page.onConsoleMessage = function (msg, lineNum, sourceId) {
            console.log('Slimer.IO CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
        };
/*
        this.page.onLoadStarted = function () {
            //console.log('Slimer.IO onLoadStarted');
        };

        this.page.onResourceRequested = function (requestData, networkRequest) {
            //  console.log('SLimer.IO  Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
        };

        this.page.onInitialized = function () {
            //console.log('SLimer.IO initialized');
        };
*/
        this.page.onLoadFinished = (status) => {
            //console.log('SLimer.IO Load Finished - Status: ' + status);
            this.initialized = true;
            let newClient;

            if (this.pendingClients.length !== 0) {
                while (newClient = this.pendingClients.shift()) {
                    this.createSocket(newClient.name, newClient.url, newClient.token, newClient.callback);
                }
            }

            this.page.onCallback = (data: ISocketEvent) => {
                this.fireOnEvent(data);
            };
        };

        const content = `<html><body>
    <script type="text/javascript" src="${url}/socket.io/socket.io.js"></script>
    </body></html>`;

        this.page.setContent(content, 'http://www.whatever.com');
    }

    private fireOnEvent(data: ISocketEvent) {
        this.slimerSockets[data.name].fireOnEvent(data.event, data.data);
    }

}

export class SlimerSocket {

    private onListeners = {};

    constructor(private name, url, token, private page) {

        this.page.evaluate((name :string, url:string, token:string) => {
            if (typeof window['socket'] === 'undefined') {
                window['socket'] = {};
            }
            const socket:SocketIOClient.Socket = window['io'](url + '?token=' + token);
            socket.on('connect', () => {
                console.log('Slimer.IO connected ! ' + url);
            });
            window['socket'][name] = socket;
        },name,  url, token);

    }

    private addOnListener ( event:string, listener:Function) {
        if (!this.onListeners[event]) {
            this.onListeners[event] = [];
        }
        this.onListeners[event].push(listener);
    };

    public fireOnEvent  (event:string, data:any) {
        if (!this.onListeners[event]) {
            return;
        }
        this.onListeners[event].forEach((listener) => {
            listener(data);
        });
    }

    on(event:string, callback:Function) {
        console.log('Slimer.IO received event ' + this.name);
        this.addOnListener(event, callback);

        this.page.evaluate((name:string, event:string) => {
            window['socket'][name].on(event, (data) => {
                window['callPhantom']({
                    name: name,
                    event: event,
                    data: data
                });
            });
        }, this.name, event);
    };

    emit(event:string, message:any) {
        console.log('slimer.IO emitting ' + this.name + ' -> ' + event);
        var success = this.page.evaluate((name, event, message) => {
            window['socket'][name].emit(event, message);
            return true;
        }, this.name, event, message);

        if (success !== true) {
            console.log('Failure while emitting the message.')
            throw new Error('Failure while emitting the message.');
        }
    };

    close() {
        var success = this.page.evaluate((name) => {
            console.log('slimer.IOclosing Socket');
            window['socket'][name].close();
            return true;
        }, this.name);
        if (success !== true) {
            console.log('Failure while closing the socket.');
            throw new Error('Failure while closing the socket.');
        }
    };
}