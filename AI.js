SCG.AI.initialize = function(){
	if(SCG.AI.worker){
		SCG.AI.worker.terminate();
		SCG.AI.worker = undefined;

		URL.revokeObjectURL(SCG.AI.blobURL);
	}

	if(SCG.scenes.activeScene.game && SCG.scenes.activeScene.game.AI){
		SCG.AI.blobURL = URL.createObjectURL( new Blob([ '(',
			"function(){var queue = [];\nconsole.log('worker start');\n" + 

				(SCG.scenes.activeScene.game.AI.queueProcesser != undefined && isFunction(SCG.scenes.activeScene.game.AI.queueProcesser) 
				? SCG.scenes.activeScene.game.AI.queueProcesser.toString() 
				: "function queueProcesser(){}")+

				"\nfunction processMessageQueue(){\nif(queue.length > 0){\n"+
						"queueProcesser();\n" +
					"}\nsetTimeout(processMessageQueue, 100);\n}\n" +

				"self.onmessage = function(e){\n" +
					"var msg = e.data;\n"+
					"switch(msg.command){\n"+
						"case 'event':\n"+
							"queue.push(msg.event);\n"+
							"break;\n"+
						"case 'initialize':\n"+
							"self.environment=msg.environment;\n"+
							"queue.push({type: 'start', message: undefined})\n" +
							"break;\n"+
						"default:\n"+
							"break;\n"+
					"}\n"+
				"}\n"+

				"processMessageQueue();\n"+
				
			"}",

			
		')()' ], { type: 'application/javascript' } ) );

		SCG.AI.worker = new Worker(SCG.AI.blobURL); 
	}

	if(SCG.AI.worker && SCG.scenes.activeScene.game.AI.messagesProcesser != undefined && isFunction(SCG.scenes.activeScene.game.AI.messagesProcesser)){
		SCG.AI.worker.onmessage = function(e) {
			SCG.scenes.activeScene.game.AI.messagesProcesser(e.data);
		};
	}
}

SCG.AI.initializeEnvironment = function (environment) {
	SCG.AI.worker.postMessage({ command: "initialize", environment: environment });
}

SCG.AI.sendEvent = function (event) {
	SCG.AI.worker.postMessage({ command: "event", event: event });
}
