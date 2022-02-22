const { response } = require("express")
var http =require("http");
var url = require("url");


function start(route){
    function onRequest(request,response){
        var pathname =url.parse(request.url).pathname;
        console.log(pathname)
        response.writeHead(200, {"Content-Type": "text/plain"});
        // route(pathname);
        response.write("Hello World");
        response.end();
    };
    console.log("server start")
    http.createServer(onRequest).listen(8889);
}
exports.start = start;