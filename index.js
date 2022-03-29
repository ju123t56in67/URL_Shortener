var requsetHandlers = require("./requestHandler")

var handle=[]
handle["/api/v1/urls"] =requsetHandlers.post_action();
handle["/:id"] =requsetHandlers.findById_action();

