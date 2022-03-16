const express = require("express")
const app =express();
const mysql = require("mysql");
const bodyParser = require('body-parser');
app.use(bodyParser.text({type: '*/*'}))
const url = require("url")
const sd = require('silly-datetime');
const redis = require("redis");
const { promisify } = require("util");

const client = redis.createClient()



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
        user=url.parse(user).pathname
        user =user.substring(1)
        var expireAt = JSON.parse(req.body).expireAt
        connection.query('select count(*) "count" from urlDb',function(err,result){
            if(err) throw err
            const count = result[0].count
            const shortUrl = count;
            console.log("Post data url: "+user+" shortUrl: "+shortUrl+" expireAt: "+expireAt)
            connection.query("insert into urlDb(url,shortUrl,expired_time) values ('"+user+"','"+shortUrl+"','"+expireAt+"');",function(err,result){
            if(err) throw err
            var redisData = {
                "url":user,
                "expired_time":expireAt
            }
            client.set(count,JSON.stringify(redisData),redis.print)
            res.send("id:"+count+","+"\r\n"+"shortUrl:  "+"http://localhost:8888/"+shortUrl)
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
        let id = url.parse(req.url).pathname;
        id = id.substring(1)
        client.get(30,redis.print)
        let expired_time
        let redir =""
        connection.query('select expired_time,url "redirUrl" from urlDb where id = ?',[id],(err,result)=>{
            if(err){
                console.log("findbyid occur error")
            }else{
                if(isObjEmpty(result)){
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
                        console.log("redirect to: "+redir)
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
    if((Date.parse(presentTime)).valueOf()>(Date.parse(expir)).valueOf()){
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