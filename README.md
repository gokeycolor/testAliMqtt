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
 
# 编辑flow
https://github.com/guokaicheng/testAliMqtt/blob/master/flow.jpg