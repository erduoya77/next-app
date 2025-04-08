---
title: "cron 定时任务怎么玩"
date: 2025-02-25
tags: ["cron"]
backImg: "https://s21.ax1x.com/2025/02/26/pE1LMz6.png?t=1a55bd7a-a0b6-80bd-bdc0-cc57144533ea"
category: "工具"
type: "post"
---
`cron` 是一个在 Unix 和类 Unix 操作系统中用于定时执行任务的守护进程。通过 `cron`，用户可以安排脚本或命令在特定的时间或周期性地自动运行。`cron` 使用一个称为 `crontab` 的文件来存储和管理这些定时任务。

---

## 1. `crontab` 文件格式

每个用户的 `crontab` 文件包含一系列的任务，每个任务占一行。每行的格式如下：

```
* * * * * command-to-be-executed
```

其中，五个星号分别表示：

1. **分钟** (0 - 59)
2. **小时** (0 - 23)
3. **日期** (1 - 31)
4. **月份** (1 - 12)
5. **星期** (0 - 7) （0 和 7 都表示星期日）

每个字段可以使用以下特殊字符：

- ``：表示所有可能的值。
- `,`：表示多个值，例如 `1,3,5`。
- ``：表示一个范围，例如 `1-5`。
- `/`：表示步长，例如 `/2` 表示每 2 个单位。

---

**示例**

- 每天凌晨 2 点执行脚本：

  ```
  0 2 * * * /path/to/script.sh
  ```
- 每 5 分钟执行一次命令：

  ```
  */5 * * * * /path/to/command
  ```
- 每周一的上午 8 点执行任务：

  ```
  0 8 * * 1 /path/to/task
  ```

---

## 2. `crontab` 命令

`crontab` 命令用于管理用户的 `cron` 任务。常用的子命令包括：

- **`crontab -e`**：编辑当前用户的 `crontab` 文件。
- **`crontab -l`**：列出当前用户的 `crontab` 文件内容。
- **`crontab -r`**：删除当前用户的 `crontab` 文件。
- **`crontab -u username`**：管理指定用户的 `crontab` 文件（需要管理员权限）。

---

**示例**

- 编辑当前用户的 `crontab` 文件：

  ```
  crontab -e
  ```
- 列出当前用户的 `cron` 任务：

  ```
  crontab -l
  ```
- 删除当前用户的所有 `cron` 任务：

  ```
  crontab -r
  ```

---

## 3. 注意事项

- `cron` 任务的执行环境可能与用户登录时的环境不同，因此建议在脚本中设置完整路径或明确的环境变量。
- `cron` 任务的输出默认会通过邮件发送给用户。如果需要重定向输出，可以使用 `>` 或 `>>`：

  ```
  * * * * * /path/to/command > /path/to/logfile 2>&1
  ```

---

通过 `cron`，用户可以轻松实现定时任务的自动化管理，非常适合用于备份、日志清理、系统维护等场景。

## 4. 脚本分享

1. 定时删除无 tag 的 docker 镜像

   ```bash
   #!/bin/bash

   # 找到无tag的镜像ID
   IMAGE_IDS=$(docker images | grep '<none>' | awk '{print $3}')

   # 循环删除无tag的镜像
   for IMAGE_ID in $IMAGE_IDS
   #do
       docker rmi $IMAGE_ID
   done
   ```
   ```bash
   #定时每天0点执行
   0 0 * * * /tmp/corn-rm-docker-images.sh
   ```
2. 由于 seafile-cli 没有定时同步，我就采取定时复制 memos数据目录，然后让seafile-cli 同步复制后的文件夹，这样就达到了定时备份 memos 的数据。

   ```bash
   # 由于memos的数据可能实时在变化，这里添加flock
   0 0 * * * flock -xn /tmp/stargate1.lock -c 'cp /root/.memos/* /tmp/memos/'
   ```
   > `flock` 是一个用于文件锁定的命令行工具，通常用于确保同一时间只有一个实例的脚本或程序运行。`flock` 通过锁定文件来实现互斥访问，避免多个进程同时执行同一段代码。
   >
