# 在IoT2040中安装testAlimqtt节点
1. 下载testAliMqtt-master.zip使用winscp复制到/home/root目录下
2. putty 登录IoT2040
3. `unzip testAliMqtt-master.zip`
4. `mv testAliMqtt-master /usr/lib/node_modules/testAliMqtt` 
5. `cd /usr/lib/node_modules`
6. `npm install -g testAliMqtt`
 
# 在IoT2040中安装node-red-contrib-s7节点
1. `cd /usr/lib/node_modules`
2. `npm install -g node-red-contrib-s7`

# 启动 Node-red  
 `/usr/bin/node /usr/lib/node_modules/node-red/red & `
 
# Node-red 编辑flow
在浏览器中输入地址 http://iot2040IPaddress:1880 进入 Node-red 编辑界面

在浏览器左侧找到需要使用的节点

![查看节点](https://github.com/guokaicheng/testAliMqtt/blob/master/doc/nodes.jpg)

按下图填写alimqtt connector 和 alimqtt properties 结点参数

![编辑connector节点](https://github.com/guokaicheng/testAliMqtt/blob/master/doc/connector.jpg)

![编辑property节点](https://github.com/guokaicheng/testAliMqtt/blob/master/doc/property.jpg)

在阿里云物联网平台如何创建产品与设备，如何为产品定义物模型以及如何获取设备三元组，请参考以下链接

https://help.aliyun.com/document_detail/73705.html?spm=5176.10695662.1996646101.searchclickresult.714039eemagVnN

S7 通信节点配置参考以下链接

https://support.industry.siemens.com/tf/ww/en/posts/s7-communication-with-node-red/159131



点击右上角的Deploy ，发布编辑完成的flow

![flow](https://github.com/guokaicheng/testAliMqtt/blob/master/doc/flow.jpg)

