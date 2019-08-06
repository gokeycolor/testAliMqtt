function signHmacSha1(params, deviceSecret) {
		let keys = Object.keys(params).sort();
		// 按字典序排序
		keys = keys.sort();
		const list = [];
		keys.map((key) => {
			list.push(`${key}${params[key]}`);
		});
		const contentStr = list.join('');
		return crypto.createHmac('sha1', deviceSecret).update(contentStr).digest('hex');
	};

//IoT平台mqtt连接参数初始化
function initMqttOptions(deviceConfig) {
	    const params = {
					productKey: deviceConfig.productKey,
					deviceName: deviceConfig.deviceName,
					timestamp: Date.now(),
					clientId: Math.random().toString(36).substr(2),
	    	}
	    //CONNECT参数
	    const options = {
					keepalive: 60, //60s
					clean: true, //cleanSession保持持久会话
					protocolVersion: 4, //MQTT v3.1.1
					reconnectPeriod: 1000,
					connectTimeout: 30000
	    	};
	    //1.生成clientId，username，password
	    options.password = signHmacSha1(params, deviceConfig.deviceSecret);
	    options.clientId = `${params.clientId}|securemode=3,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
	    options.username = `${params.deviceName}&${params.productKey}`;

	    return options;
	};

  const crypto = require('crypto');
  const mqtt = require('mqtt');

	function connect(deviceConfig){
		const options = initMqttOptions(deviceConfig);
  	const url = `tcp://${deviceConfig.productKey}.iot-as-mqtt.${deviceConfig.regionId}.aliyuncs.com:1883`;
		//2.建立连接
		//console.log(options);
		//console.log(url);
		return  mqtt.connect(url, options);
	};
  
module.exports = function(RED) {
	function AliMqtt(n) { 
		RED.nodes.createNode(this,n);          // 创建节点
		var node = this;
		var msg={payload:""};
		var deviceConfig = {
				productKey: "",
				deviceName: "",
				deviceSecret: "",
				regionId: "cn-shanghai"
			};
		var status = "waiting...";
		deviceConfig.productKey=this.credentials.productKey;
		deviceConfig.deviceName=this.credentials.deviceName;
		deviceConfig.deviceSecret=this.credentials.deviceSecret;
		deviceConfig.regionId=n.regionId; 
		node.status({fill:"green",shape:"ring",text:status});
	  const subscribeTopic = n.subscribeTopic;
		
		var client = null;
		client=connect(deviceConfig);	
		//console.log(client.options.clientId);
		
		const topic = `/sys/${deviceConfig.productKey}/${deviceConfig.deviceName}/thing/event/property/post`;
		const subTopic = `/${deviceConfig.productKey}/${deviceConfig.deviceName}/${subscribeTopic}`;
		if (subscribeTopic !=null ){
			client.subscribe(subTopic);
			}
		//release node resources
		this.on('close', function () { // <-- no 'done' argument, nothing more is needed
					if(client !=null)
					{
						client.end();
					};
					//console.log('RandomNode Closed');
			});
		/*
		this.on('close', function (done) { // <-- 'done' argument - you MUST call this when you're done.
						console.log('RandomNode Closed');
						done();
		});
		*/
		node.on('input', function(msg) {  
			//construct JSON message 
			//console.log(client.options.clientId)	
			let post =null;
			if (client.connected){
				status = "connected";
				node.status({fill:"green",shape:"dot",text:status});
				let a = {"id":Date.now()};
				a["params"]= msg.payload;
				a["method"]="thing.event.property.post";
				//console.log("===postData\n topic=" + topic);
				//console.log(a);
					post = JSON.stringify(a);
					client.publish(topic, post);
					node.send(post);
				}
			else 
				{
					client.reconnect();
					node.status({fill:"green",shape:"ring",text:"reconnecting..."});
					node.send("connection failed, reconneting...");
				}		
			});

		//3.属性数据上报	
		client.on('connect', function (connack) {		//Emitted on successful (re)connection (i.e. connack rc=0).
				//console.log(client.options.clientId);	
				if(connack.returnCode == 0){
					status = "connected";
					node.status({fill:"green",shape:"dot",text:status});
					}
				else{
						//console.log(`Connection failed: ${connack.returnCode}`);
						//status = "error";
						node.status({fill:"red",shape:"dot",text: connack.returnCode.toString()});
					}
				// node.send(msg);
				//console.log("connect event "+ status);
			});

		client.on('message', function(topic, message) {
			//    console.log("topic " + topic)
			//		console.log("message " + message)
				msg = { payload: "message " + message };			
				node.send(msg);
				
			});
		/*
			client.on('packesend', function (){
				node.status({fill:"green",shape:"dot",text:"packesend"});
			});
			
			client.on('packreceive', function (){
				node.status({fill:"green",shape:"dot",text:"packreceive"});
			});
		*/
		client.on('close', function (){		//Emitted after a disconnection.
			//console.log(client.options.clientId);	
			status = "disconnection";
			node.status({fill:"red",shape:"dot",text:status});
			//node.send(status);
			//console.log(status);
			//client.end();
			});

		client.on('error', function (){
			//console.log(client.options.clientId)
			status = "error";
			node.status({fill:"yellow",shape:"ring",text:status});
			//	node.send(status);
			//	console.log(status);
			//	client.end();
			});

		client.on('end', function (){
			//console.log(client.options.clientId)
			status = "end";
			node.status({fill:"yellow",shape:"ring",text:status});
			//node.send(status);
			//console.log(status);	
			});

		client.on('reconnect', function (){	//Emitted when a reconnect starts
				//console.log(client.options.clientId);	
				status = "reconnect";
				node.status({fill:"bule",shape:"ring",text:status});
				//node.send(status);
				//client.end();
				//client = connect(deviceConfig);
				//console.log("Start===================Reconnect\n");
				//console.log(client);
				//console.log("End===================Reconnect\n");	
				//console.log(status);
			});

		client.on('offline', function () {   //Emitted when the client goes offline.
			//console.log(client.options.clientId);	
			status = "offline";
			node.status({fill:"red",shape:"ring",text:status});
			//node.send(status);
			//console.log("client went offline")
			//console.log(status);
			//client.end();
			});
		}

	RED.nodes.registerType("alimqtt connector",AliMqtt,{
		credentials: {
				productKey: {type:"password"},
				deviceName: {type:"text"},
				deviceSecret:{type:"password"}
					}
		});   // 注册节点类型


	function AliMqttProperty(n){
		RED.nodes.createNode(this,n);
		let node = this;
		this.on('input', function(msg){
			let key={};
			let name = msg.browseName;
			//console.log(name);
			if (name ==null)
					{name=node.name;}
			//else
			//	{				
			//		name = name.split('s=')[name.split('s=').length-1];
			//		name = name.replace(/\"/g, "");
			//	}
			if (msg.payload == null)
				{ key[name]= node.value}
			else		
				{ key[name]= parseFloat(msg.payload.toFixed(2))}
			this.status({fill:"blue",shape:"dot",text: parseFloat(msg.payload.toFixed(2))});
			node.send({ payload:key });
			});
		}

	RED.nodes.registerType("alimqtt property",AliMqttProperty);

	}