# URL_Shortener

## Enviroments
```
node : v16.14.0
MySQL : 5.7
Redis : 3.1.1

```
## Setting the MySQL Workspace
```
#justinchiu/mysql_backup is mine mysql image

docker pull justinchiu2000/mysql_backup

docker run --name mysql  -p 6603:3306 -d justinchiu2000/mysql_backup
```
## Run Server

```
git clone https://github.com/ju123t56in67/URL_Shortener.git

node index.js

```


## Post Method


```
#Example

{
    "url":"http://localhost:8888/HelloDcard",
    "expireAt":"2022-04-05 17:20:55"
}

```
### Result
![image](https://github.com/ju123t56in67/URL_Shortener/blob/main/postman.png)

## GET Method

### Expired Url
![image](https://github.com/ju123t56in67/URL_Shortener/blob/main/Expired%20Url.png)

-------------------------------------------------------

### Redirect Page
![image](https://github.com/ju123t56in67/URL_Shortener/blob/main/RedirectPage.png)

-----------------------------------------------------
### Can't find in DB
![image](https://github.com/ju123t56in67/URL_Shortener/blob/main/Error.png)


## Record the bug during developing

2/22 專案的資料庫我是用docker建mysql 欄位有 id,url,,expired_time(設定過期時間)  資料庫連接問題是用mysql8(版本太新) 我現在用的版本是5.7

3/16 開始使用redis 之前會出錯是因為 npm install redis的版本是4.0.0 所以導致都不會有反應
    解決方法 : npm uninstall redis -- save
              npm install redis@3.1.1 -- save 
