const express = require("express")
const app =express();
const mysql = require("mysql");
const bodyParser = require('body-parser');
app.use(bodyParser.text({type: '*/*'}))
const url = require("url")
const sd = require('silly-datetime');
const redis = require("redis");
const client = redis.createClient(6379,'127.0.0.1');


client.connect((err)=>{
    if(err){
        console.log("Redis connect fail")
    }
})


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'localDb'
});

function post_action(){
    app.post("/api/v1/urls",(req,res)=>{
        console.log("start posting")
        var user = JSON.parse(req.body).url
        console.log(user)
        var expireAt = JSON.parse(req.body).expireAt
        connection.query('select count(*) "count" from urlDb',function(err,result){
            if(err) throw err
            const count = result[0].count
            const shortUrl = user+"/"+count;
            connection.query("insert into urlDb(url,shortUrl,expired_time) values ('"+user+"','"+shortUrl+"','"+expireAt+"');",function(err,result){
            if(err) throw err
            res.send("id:"+count+","+"\r\n"+"shortUrl:  "+"http://localhost/"+shortUrl)
            });
        });
    });
}

async function testing(){
    const dic = await client.get((err,result)=>{
        console.log(result)
        return result
    })
    return dic
}

function findById_action(){
    app.get("/:id",(req,res,next)=>{
        client.set('test','shortUrl',redis.print)
        testing().then(result=>{
            console.log(result)
        })
        let id = url.parse(req.url).pathname;
        id = id.substring(1)
        let expired_time
        let redir =""
        connection.query('select expired_time,url "redirUrl" from urlDb where id = ?',[id],(err,result)=>{
            if(err){
                console.log("findbyid occur error")
            }else{
                if(isObjEmpty(result)){
                    // client.setEx("url",result[0].redirUrl);
                    // console.log("redis: "+client.get("url"))
                    res.writeHead(404, {"Content-Type": "text/plain"});
                    res.write("Can't find the id in db");
                    res.send()
                    next()
                }else{
                    redir = result[0].redirUrl
                    expired_time =  new Date(result[0].expired_time)
                    if(checkTime(expired_time)){
                        res.writeHead(404, {"Content-Type": "text/plain"});
                        res.write("time has already expired");
                        res.send()
                        next()
                    }else{
                        res.redirect("http://localhost:8888/"+redir+"")
                        next()
                    }
                }
            }
        })
    });
}


function isObjEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function checkTime(expir){
    var presentTime = sd.format(new Date(),'YYYY-MM-DD HH:mm:ss');
    presentTime = new Date(presentTime)
    if(presentTime>expir){
        return true
    }else{
        return false
    }
}

app.listen(8888,()=>
    console.log("Server 8888 is start")
)

exports.post_action = post_action
exports.findById_action  = findById_action