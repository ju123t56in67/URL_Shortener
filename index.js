const express = require("express")
const app =express();
const mysql = require("mysql");
const bodyParser = require('body-parser');
app.use(bodyParser.text({type: '*/*'}))
const redis = require("redis")
const url = require("url")
const sd = require('silly-datetime');



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'localDb'
});

connection.connect((err)=>{
    if(err) throw err;
    console.log("Database Connected Successfully")
});

app.get("/:id",(req,res)=>{
    var time = sd.format(new Date(),'YYYY-MM-DD HH:mm:ss');
    time = new Date(time)
    let id = url.parse(req.url).pathname;
    id = id.substring(1)
    let expired_time
    let redir
    connection.query('select expired_time,url from urlDb where id = ?',[id],(err,result)=>{
        if(err){
            console.log("Finding by id is error")
        }else{
            try{
                redir = result[0].url
                expired_time =  new Date(result[0].expired_time)
                if(time.valueOf()>expired_time.valueOf()){
                    res.writeHead(404, {"Content-Type": "text/plain"});
                    res.write("The time has already expired");
                    res.send()
                }else{
                    res.redirect("http://localhost:8885/"+redir+"")
                }
            }catch(err){
                console.log(err)
            }
        }
    })
});

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

app.listen(8888,()=>
    console.log("Server 8888 is start")
)