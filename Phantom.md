Daemon launches 2 servers

- socketServer
    - depends on
        - ServerCache set()
        - socket config (port)
    
- cacheServer
    - depends on
        - request
        - RestCache has() get() getCategory()
        - SlimmerCache has() get() getCategory()
        - cacheServerConfig (port)
    
    
- rendererServer
    - depends on
        - ServerCache  has() & get() 
        - ServerConfig (Should Render)
        - spawn Slimmer renderer
        - write config in tmp file/??? maybe not
        

- Library usage : 
 
 
 AngularServer.renderURL(url)
 AngularServer.renderHTML(url, html)
 
 - depends on
    - rendererServer host & port
    - writes html in tmp file
 
 
 - ASP & PHP integration
 <?php
 ob_start();
 
 .... rendering
 http://elephant.io/
 $html = ob_get_content();
 
 then open a socket to the rendererServer with a uuid
 
 socket.emit('render', $uuid, $url, $html);
 socket.on('rendered_'.$uuid, function($html) {
 
 });