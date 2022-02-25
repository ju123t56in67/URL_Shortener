const express = require("express")
const app =express();
const mysql = require("mysql");
const bodyParser = require('body-parser');
app.use(bodyParser.text({type: '*/*'}))

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

app.get("/",(req,res)=>{
    res.send("hello")
})
app.get("/:id",(req,res)=>{
    res.send(req.params.id)
})

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