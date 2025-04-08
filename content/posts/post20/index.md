---
title: "乌班图系统磁盘满了且删不掉？"
date: 2024-12-17
tags: ["问题记录"]
backImg: "https://s21.ax1x.com/2024/12/17/pALmKOg.jpg?t=15e5bd7a-a0b6-807d-aff3-ed31fd11ba52"
category: "问题"
type: "post"
---
通过 `df -h`命令查看这台机器下面的根目录已经满了

![image.png](images/image.png)

接着去到根目录下面，通过`du -sh  */` 查看具体是哪个目录占用较大

![image.png](images/image%201.png)

然后进入到/var 目录下面继续通过`du -sh  */`  来查看大文件的目录，最终锁定在一个容器的日志文件下面

![image.png](images/image%202.png)

确定这个日志文件可以删除后，通过 rm 删除改文件，但是再次查看磁盘空间发现还是并没有变小

![image.png](images/image%203.png)

接着通过 `lsof -n | grep deleted` 查找出那些已经删除但是继续占用内存空间的文件

确认好以后重启这个 docker容器，磁盘空间恢复正常

![image.png](images/image%204.png)
