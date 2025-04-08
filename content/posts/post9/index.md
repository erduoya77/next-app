---
title: "安装dashboard和使用"
date: 2024-04-11
tags: ["k8s"]
AISummary: 本文介绍了如何安装和使用 Kubernetes Dashboard。安装过程包括拉取安装文件、修改配置文件、创建服务并检查启动情况，以及创建用户并分配权限。使用过程包括通过浏览器访问 Dashboard、输入 Token 进入控制台，并使用 Dashboard 启动一个 Nginx 服务。还介绍了编辑 svc/ingress 文件以便外部访问服务的方法。
category: "工作"
type: "post"
---
# 一、安装 dashboard

1.在 master 上安装dashboard(拉取失败的话可以下载附件传到服务器)

```bash
wget  https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-rc7/aio/deploy/recommended.yaml
```

[recommended.yaml](images/recommended.yaml)

2.修改配置文件，用 NodePort 模式方便等会页面访问

```bash
vi recommended.yaml 
```

![Untitled](images/Untitled.png)

3.创建dashboard服务，检查是否正常启动

```bash
kubectl apply -f  recommended.yaml 

kubectl get all -n kubernetes-dashboard  -o wide
```

![Untitled](images/Untitled%201.png)

> 可以看到目前dashboard运行在 node2 上，外部访问的 ip 是 31014，等会访问 https://node2:31014/

4.接着创建用户分配权限

```bash
kubectl create serviceaccount  dashboard-admin -n kube-system

kubectl create clusterrolebinding  dashboard-admin --clusterrole=cluster-admin --serviceaccount=kube-system:dashboard-admin

kubectl describe secrets -n kube-system $(kubectl -n kube-system get secret | awk '/dashboard-admin/{print $1}')
```

![Untitled](images/Untitled%202.png)

保存 token

5.通过浏览器 https://node2:31014/，。（如果浏览器提示不安全无法直接访问，点击页面输入 thisisunsafe即可）

![Untitled](images/Untitled%203.png)

6.输入 token 进入控制台

![Untitled](images/Untitled%204.png)

7.快捷生成 token

```bash
kubeadm token create --print-join-command
```

至此dashboard安装完毕！

# 二、使用dashboard启动一个 nginx

![Untitled](images/Untitled%205.png)

![Untitled](images/Untitled%206.png)

![Untitled](images/Untitled%207.png)

编辑 svc/ingress，将type 由‘LoadBalancer’改成‘NodePort’ ；就可以外部访问

![Untitled](images/Untitled%208.png)

![Untitled](images/Untitled%209.png)

![Untitled](images/Untitled%2010.png)

![Untitled](images/Untitled%2011.png)
