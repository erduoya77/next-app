---
title: "timestamps导致的服务器 rst 问题"
date: 2024-11-01
tags: ["问题记录"]
backImg: "https://s21.ax1x.com/2024/11/19/pARvUtH.png?t=12a5bd7a-a0b6-80b9-8efa-ecfef517925a"
category: "问题"
type: "post"
---
问题现象：

客户通过 F5 做反向代理，当客户端访问的时候会出现 rst，最后定位到是服务器偶发的 rst

![PixPin_2024-11-19_10-45-11.png](images/PixPin_2024-11-19_10-45-11.png)

![PixPin_2024-10-25_14-15-59.png](images/PixPin_2024-10-25_14-15-59.png)

最后查了很久也是发现和 centos7 的一个参数有关

```jsx
sysctl -w net.ipv4.tcp_tw_recycle=1
```

![PixPin_2024-10-25_14-10-04.png](images/PixPin_2024-10-25_14-10-04.png)

---

参考：
https://blog.51cto.com/leejia/1954628
