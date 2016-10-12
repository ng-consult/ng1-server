# ServerLog

- test folder creation
- test writting in correct files

# MasterProcess

- Test constructor 
    - valid folder
    - config files exists
- Mock child_process
    - test that it iscalling with corret argument.
    - test that file exists.
    - test that file permission are ok.
    
# NgServerClient

- Mock IO
- Test constructor for invalid parameters
    - test on connect/connect error
    - test timeout retrieval
    
- renderURL
    - test queue
    - test emit(renderURL) and response
- renderHTML
    - test Queue
    - testEmit
- test on('response')

# Renderer Process

- mock spawn
- mock process.send
- mock process.on
- test constructor
- start()
    - test process.on()
    - test shouldRender()
- test Render
    - test spawn is called with correct arguments
    - test on(error)
    - test on(close)
    - test timeout
    - test kill
    
# SocketServer

- mock io
- mock spawn
- mock process.end
- mock process.on
- mock cacheEngine
- mock instance
- test constructor
    - test two io connections
- test start
    - test cacheEngine is instanciated
    - test http is launched
- test slimerApp
    - on(log)
    - on(rendered)
    - on(disconnect)
    

    

