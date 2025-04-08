---
title: "外部 etcd 集群"
date: 2024-10-09
slug: post15
tags: ["k8s"]
backImg: "https://s21.ax1x.com/2024/10/09/pAGXxZn.png?t=11a5bd7a-a0b6-804b-84cc-ee109984c399"
category: "工作"
type: "post"
---
**环境准备**
三台服务器：
*• master1: 192.168.1.220
• master2: 192.168.1.221
• master3: 192.168.1.222*

每台服务器需要安装 etcd 和 kubeadm，并确保服务器时间同步，可以使用 chrony 或 ntp

**1. 安装必要工具**
在每台 Ubuntu 服务器上执行以下命令：

```
sudo apt update
sudo apt install -y chrony curl apt-transport-https

```

确保时间同步

```
sudo systemctl enable chrony && sudo systemctl start chrony

```

**2. 下载并安装 etcd 二进制**
可以从 [GitHub etcd Releases](https://github.com/etcd-io/etcd/releases) 下载 etcd 的最新版本。以下以 etcd v3.5.0 为例：

```
ETCD_VER=v3.5.0

# 下载二进制文件
wget https://github.com/etcd-io/etcd/releases/download/v3.5.0-alpha.0/etcd-v3.5.0-alpha.0-linux-amd64.tar.gz
tar -xvf etcd-v3.5.0-alpha.0-linux-amd64.tar.gz
mkdir -p /opt/etcd/bin
sudo mv etcd-v3.5.0-alpha.0-linux-amd64/etcd* /opt/etcd/bin/
```

检查是否安装成功：

```
cd /opt/etcd/bin/
./etcd --version

```

**3. 创建证书**
在 etcd 集群中，所有节点间的通信都需要加密。你需要使用 cfssl 来生成证书。
**master1安装 cfssl 和 cfssljson：**

```
sudo apt install -y golang-cfssl

```

创建证书文件：

1. 创建证书配置文件：

```
mkdir -p /opt/etcd/ssl
cd /opt/etcd/ssl

```

```
vim ca-config.json

{
    "signing": {
        "default": {
            "expiry": "8760h"
        },
        "profiles": {
            "kubernetes": {
                "usages": ["signing", "key encipherment", "server auth", "client auth"],
                "expiry": "8760h"
            }
        }
    }
}

```

```
vim ca-csr.json

{
    "CN": "etcd-ca",
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "C": "CN",
            "L": "Shanghai",
            "O": "Kubernetes",
            "OU": "System"
        }
    ]
}

```

生成 CA 证书和私钥：

```
cfssl gencert -initca ca-csr.json | cfssljson -bare ca

```

为 etcd 集群生成服务器证书，创建 server-csr.json 文件:

```
vim server-csr.json

{
    "CN": "etcd",
    "hosts": [
        "192.168.1.220",
        "192.168.1.221",
        "192.168.1.222",
        "localhost"
    ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "C": "CN",
            "L": "Shanghai",
            "O": "Kubernetes",
            "OU": "System"
        }
    ]
}

```

生成服务器证书：

```
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -hostname="192.168.1.220,192.168.1.221,192.168.1.222,localhost" -profile=kubernetes server-csr.json | cfssljson -bare server

```

![https://img.erduoya.top//20241009110542.png](https://img.erduoya.top//20241009110542.png)

将生成的证书文件 ca.pem，server.pem，server-key.pem 复制到master2和 master3的 /opt/etcd/ssl/ 目录下。

**4. 配置 etcd 服务**
在每台服务器上创建 etcd 的 systemd 服务文件：

- 这里面的/var/lib/etcd是 etcd 数据目录，如果之前有做过 etcd 集群，需要先执行 "rm -rf /var/lib/etcd"删除这个目录

```
vim /etc/systemd/system/etcd.service
[Unit]
Description=etcd
Documentation=https://github.com/coreos
After=network.target
Wants=network-online.target

[Service]
Type=notify
ExecStart=/opt/etcd/bin/etcd \
  --name=master1 \
  --data-dir=/var/lib/etcd \
  --listen-client-urls=https://192.168.1.220:2379,https://127.0.0.1:2379 \
  --advertise-client-urls=https://192.168.1.220:2379 \
  --listen-peer-urls=https://192.168.1.220:2380 \
  --initial-advertise-peer-urls=https://192.168.1.220:2380 \
  --initial-cluster=master1=https://192.168.1.220:2380,master2=https://192.168.1.221:2380,master3=https://192.168.1.222:2380 \
  --cert-file=/opt/etcd/ssl/server.pem \
  --key-file=/opt/etcd/ssl/server-key.pem \
  --peer-cert-file=/opt/etcd/ssl/server.pem \
  --peer-key-file=/opt/etcd/ssl/server-key.pem \
  --trusted-ca-file=/opt/etcd/ssl/ca.pem \
  --peer-trusted-ca-file=/opt/etcd/ssl/ca.pem \
  --initial-cluster-state=new \
  --initial-cluster-token=etcd-cluster-1 \
  --client-cert-auth \
  --peer-client-cert-auth
Restart=always
RestartSec=5
LimitNOFILE=40000

[Install]
WantedBy=multi-user.target
```

另外两个 master 也是执行相同的操作，然后需要根据具体 IP 和节点名修改 --name 和 --listen-client-urls、--advertise-client-urls、--listen-peer-urls、--initial-advertise-peer-urls 的 IP 地址。
**5. 启动 etcd**
在每台服务器上执行以下命令，启动 etcd：

```
sudo systemctl daemon-reload
sudo systemctl enable etcd
sudo systemctl start etcd

```

确认 etcd 是否正常运行：

```
sudo systemctl status etcd

```

可以使用 etcdctl 检查集群状态：

```
ETCDCTL_API=3 /opt/etcd/bin/etcdctl --cacert=/opt/etcd/ssl/ca.pem --cert=/opt/etcd/ssl/server.pem --key=/opt/etcd/ssl/server-key.pem --endpoints="https://192.168.1.220:2379,https://192.168.1.221:2379,https://192.168.1.222:2379" endpoint status -w table
```

![https://img.erduoya.top//20241009101855.png](https://img.erduoya.top//20241009101855.png)

**6. 初始化 kubeadm**

etcd集群配置完毕后，就可以进行 kubeadm 初始化了
先在所有 master 上执行 kubeadm reset
然后在 master1上面创建 kubeadm-config.yaml

```
apiVersion: kubeadm.k8s.io/v1beta3
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 192.168.1.223  # Master节点的IP
  bindPort: 6443
nodeRegistration:
  criSocket: /var/run/dockershim.sock
  imagePullPolicy: IfNotPresent
  name: master1
  taints: null

---
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
controlPlaneEndpoint: 192.168.1.223:6443  # VIP地址
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
kubernetesVersion: 1.23.0
networking:
  dnsDomain: cluster.local
  serviceSubnet: 10.96.0.0/12
  podSubnet: 10.2.0.0/16
apiServer:
  certSANs:
  - 192.168.1.222  # etcd 节点的 IP
  - 192.168.1.221
  - 192.168.1.220
  - 192.168.1.223  # VIP 地址
etcd:
  external:  # 使用外部 etcd 集群
    endpoints:
    - "https://192.168.1.222:2379"
    - "https://192.168.1.221:2379"
    - "https://192.168.1.220:2379"
    caFile: "/opt/etcd/ssl/ca.pem"  # etcd CA证书路径
    certFile: "/opt/etcd/ssl/server.pem"  # etcd客户端证书
    keyFile: "/opt/etcd/ssl/server-key.pem"  # etcd客户端密钥
imageRepository: registry.aliyuncs.com/google_containers

---
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs

```

然后初始化 kubeadm

```
kubeadm init --config kubeadm-config.yaml

```

**etcd 备份步骤**
可以使用 etcdctl 命令行工具进行备份。备份时，建议使用 snapshot 命令创建快照。
**1. 备份命令**
以下是创建 etcd 快照的命令：

```
ETCDCTL_API=3 etcdctl snapshot save /备份文件的目录/backup.db \
  --endpoints=https://192.168.1.220:2379,https://192.168.1.221:2379,https://192.168.1.222:2379 \
  --cacert=/opt/etcd/ssl/ca.pem \
  --cert=/opt/etcd/ssl/server.pem \
  --key=/opt/etcd/ssl/server-key.pem
```

**2. 恢复备份**
当需要从备份中恢复 etcd 时，可以使用 snapshot restore 命令：

```
ETCDCTL_API=3 etcdctl snapshot restore  /备份文件的目录/backup.db \
  --name=etcd-node1 \
  --initial-cluster=etcd-node1=https://192.168.1.220:2380,etcd-node2=https://192.168.1.221:2380,etcd-node3=https://192.168.1.222:2380 \
  --initial-cluster-token=etcd-cluster-1 \
  --initial-advertise-peer-urls=https://192.168.1.220:2380 \
  --data-dir=/var/lib/etcd
```

**3. 定期自动备份**
为了确保备份的持续有效性，建议使用 cron 定期备份 etcd 数据。例如，每天凌晨 3 点自动备份：

```
0 3 * * * ETCDCTL_API=3 etcdctl snapshot save /path/to/backup-$(date +\\%Y\\%m\\%d).db \
  --endpoints=https://192.168.1.220:2379,https://192.168.1.221:2379,https://192.168.1.222:2379 \
  --cacert=/opt/etcd/ssl/ca.pem \
  --cert=/opt/etcd/ssl/server.pem \
  --key=/opt/etcd/ssl/server-key.pem

```
