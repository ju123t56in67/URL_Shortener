# URL_Shortener

2/22 專案的資料庫我是用docker建mysql 欄位有 id,url,shorturl(這個是打api後把id塞在原本url的後面),expired_time(設定過期時間)  資料庫連接問題是用mysql8(版本太新) 我現在用的版本是5.7


2/25 今天的進度讓post成功  


3/8 解決了 網頁url帶id會redirect到新頁面 這個步驟所出現的error跟exception 接下來要研究redis讓指定id的資料先存起來

