---
title: "走过了Seafile 网盘的坑"
date: 2025-02-20
tags: ["seafile"]
backImg: "https://s21.ax1x.com/2025/02/20/pEQBoNt.png?t=1a05bd7a-a0b6-8035-947f-d6466fe83890"
category: "工具"
type: "post"
---
seafile 折腾下来，最终还是没有弄到 pj。这个功能确实很强大，企业版都是我想要的🤪
分享下最后整理的东西：

- [ ]  [安装文档](https://cloud.seafile.com/published/seafile-manual-cn/deploy_pro/download_and_setup_seafile_professional_server.md)
- [ ]  [客户端下载](https://www.seafile.com/download/)
- [ ]  [专业版服务器下载](https://download.seafile.com/d/6e5297246c/files/?p=%2Fpro%2Fseafile-pro-server_11.0.18_x86-64_Ubuntu.tar.gz&dl=1)
  装完后记得修改配置文件 `seafile.conf` 和 `seahub_settings.py`

---

当然了还有一键安装

```
wget <https://raw.githubusercontent.com/haiwen/seafile-server-installer-cn/master/seafile-8.0_ubuntu>
bash seafile-8.0_ubuntu xxx  #提前下载好安装包到/opt 目录下面，然后把 xxx 换成中间的版本号

```

（对了，下载下来的文件记得重命名把 Ubuntu 去了，别问我为什么知道🙃）

装完以后也没那么顺利，大概率 python依赖的版本有问题

```

#可以参考这个
pip uninstall cryptography -y
pip install --no-cache-dir cryptography

pip uninstall cryptography pyOpenSSL -y
pip install --no-cache-dir cryptography pyOpenSSL

pip install -U "sqlalchemy>=2.0"

```

---

已知Bug

[关于图片异常的修复，可以浏览不能下载的修复经历 - 经验分享 - Seafile 用户论坛](https://bbs.seafile.com/t/topic/15821)

seaf-cli 命令

```bash
#启动客户端程序
seaf-cli start

# 同步命令
seaf-cli sync -l 资源id -s seafile服务器地址 -d 本地文件夹 -u 用户名 -p 密码

# 查看同步状态
seaf-cli status 

# 删除同步
seaf-cli desync -d 本地文件夹
```

- 目前还有点问题
  - [ ]  头像不显示，检查过是图片的回显地址居然是“127.0.0.1”估计是哪儿配置错了，但是目前没找到，官方论坛里面的[解决办法](https://bbs.seafile.com/t/topic/9382/12)对于目前我装的11.0.18版本不适用；
  - [ ]  linux客户端 seaf-cli不支持设置同步时间间隔，这就很烦了目前来我是通过cron定时任务cp文件+同步指定文件夹的方式来实现的；

---

tips：

关于同步的问题，由于我是本地数据往本地的 seafile 进行同步，那么如果执行同步的时候如果直接填写 seafile 服务器的域名，比如我的 `https://pan.erduoya.top`，传输就会走公网，这样很慢。

所以我这边是修改 `hosts`文件，将 `pan.erduoya.top` 指向到 `127.0.0.1` ,这样同步传输就很快了。
