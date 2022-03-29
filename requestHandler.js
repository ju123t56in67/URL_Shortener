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


var flag = false;

const connection = mysql.createConnection({
    host: 'localhost',
    port:'6603',
    user: 'root',
    password: 'root',
    database: 'localDb'
});


function post_action(){
    app.post("/api/v1/urls",(req,res)=>{
        console.info("start posting")
        var user = JSON.parse(req.body).url
        user=url.parse(user).pathname
        user =user.substring(1)
        var expireAt = JSON.parse(req.body).expireAt
        connection.query('select count(*) "count" from url_info',function(err,result){
            if(err) throw err
            const count = result[0].count+1
            console.log("Post data url: "+user+" expireAt: "+expireAt)
            connection.query("insert into url_info(url,expired_time) values ('"+user+"','"+expireAt+"');",function(err,result){
            if(err) throw err
            var redisData = {
                "url":user,
                "expired_time":expireAt
            }
            client.set(count,JSON.stringify(redisData),redis.print)
            client.get(count,redis.print)
            res.send("id:"+count+","+"\r\n"+"shortUrl:  "+"http://localhost:8888/"+count)
            });
        });
    });
}


// 判斷字串是否為數字
function isNumber(val){
    return isNaN(val)
}


//get 方法
// 透過id去判斷是否過期或是轉到原本的url
function findById_action(){
    app.get("/:id",(req,res,next)=>{
        console.info("Start findById_action")
        let id = url.parse(req.url).pathname;
        id = id.substring(1)
        try{
            if(isNumber(id)){
                res.writeHead(200, {"Content-Type": "text/plain"});
                res.write("Redirect success!!!");
                res.send()
                next()
            }else{
                var redisId = Number(id)
                console.log(">>>>ID from the url: "+redisId)
                client.get(id,(err,rawData)=>{
                    if(err) {
                        console.error("Redis cache failed "+err)
                    }
                    if(!!rawData){
                        console.info("data is cached by redis")
                        var redisData = JSON.parse(rawData)
                        redisTime = redisData.expired_time
                        redisUrl = redisData.url
                        if(checkTime(redisTime)){
                            res.writeHead(404, {"Content-Type": "text/plain"});
                            res.write("time has already expired");
                            res.send()                        
                            next()
                        }else{
                            console.log("redirect to: "+redisUrl)
                            res.redirect("http://localhost:8888/"+redisUrl+"")
                            res.send();
                            next()
                        }
                    }else{
                        console.info("Searching the data in Db")
                        let expired_time
                        let redir =""
                        flag = false
                        connection.query('select expired_time,url "redirUrl" from url_info where id = ?',[id],(err,result)=>{
                        if(err){
                            console.error("findbyid occur error"+err)
                        }else{
                            if(isObjEmpty(result)){
                                if(flag){
                                    res.writeHead(200, {"Content-Type": "text/plain"});
                                    res.write("Redirect success!!!");
                                    res.send()
                                    next()
                                }else{
                                    res.writeHead(404, {"Content-Type": "text/plain"});
                                    res.write("Can't find the id in db");
                                    res.send()
                                    next()
                                }
                            }else{
                                redir = result[0].redirUrl
                                expired_time =  new Date(result[0].expired_time)
                                var redisData = {
                                    "url":redir,
                                    "expired_time":expired_time
                                }
                                client.set(id,JSON.stringify(redisData),redis.print)
                                if(checkTime(expired_time)){
                                    res.writeHead(404, {"Content-Type": "text/plain"});
                                    res.write("time has already expired");
                                    res.send()
                                    next()
                                }else{
                                    console.log("redirect to: "+redir)
                                    flag =true
                                    res.redirect("http://localhost:8888/"+redir+"")
                                    next()
                                }
                            }
                        }
                    })           
                }
            })
        }
        }catch(error){
            
        }
    });
}


// 判斷資料庫是否帶資料回來
function isObjEmpty(obj) {
    return Object.keys(obj).length === 0;
}


// 檢查時間是否過期
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
    console.info("Server 8888 is start")
)


exports.post_action = post_action
exports.findById_action  = findById_action