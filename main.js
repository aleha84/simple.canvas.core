SCG.start = function(){

	if(!SCG.canvasBg){

		SCG.canvasBg = appendDomElement(
			document.body, 
			'canvas',
			{ 
				width : SCG.viewfield.width,
				height: SCG.viewfield.height,
				id: SCG.canvasBgId,
				css: {
					'z-index': 0,
					'position': 'absolute'
				}
			}
		);

		SCG.contextBg = SCG.canvasBg.getContext('2d');
	}

	if(!SCG.canvas)
	{
		SCG.canvas = appendDomElement(
			document.body, 
			'canvas',
			{ 
				width : SCG.viewfield.width,
				height: SCG.viewfield.height,
				id: SCG.canvasId,
				css: {
					'z-index': 1,
					'position': 'absolute'
				}
			}
		);

		SCG.context = SCG.canvas.getContext('2d');

		// appendDomElement(
		// 	document.body,
		// 	'div',
		// 	{
		// 		class: 'button fulscreenbutton',
		// 		on: {
		// 			click: function(){ screenfull.toggle(document.documentElement); this.classList.toggle('exit'); }
		// 		}
		// 	}
		// );

		//SCG.debugger.setValue('App started');
	}

	SCG.initializer(function(){
		SCG.gameControls.orientationChangeEventInit();

		SCG.customInitialization();

		if(SCG.space == undefined)
		{
			SCG.space = {
				width: SCG.viewfield.default.width,
				height: SCG.viewfield.default.height
			}
		}

		SCG.viewfield.current = new Box(new Vector2,new Vector2(SCG.viewfield.width,SCG.viewfield.height));		

		SCG.animate();
	});
}

SCG.preMainWork = function(){}

SCG.afterMainWork = function(){}

SCG.animate = function() {
    SCG.draw();
    requestAnimationFrame( SCG.animate );   
}

SCG.draw = function(){
	if(SCG.scenes.activeScene == undefined || SCG.scenes.activeScene.go == undefined){
		throw 'Active scene corrupted!';
	}

	var now = new Date;

	SCG.gameLogics.doPauseWork(now);

	//SCG.gameControls.mousestate.doClickCheck();

	if(SCG.scenes.activeScene.preMainWork && isFunction(SCG.scenes.activeScene.preMainWork)){
		SCG.scenes.activeScene.preMainWork();	
	}
	
	var i = SCG.scenes.activeScene.go.length;
	while (i--) {
		SCG.scenes.activeScene.go[i].update(now);
		SCG.scenes.activeScene.go[i].render();
		if(!SCG.scenes.activeScene.go[i].alive){
			var deleted = SCG.scenes.activeScene.go.splice(i,1);
		}
	}

	if(SCG.scenes.activeScene.afterMainWork && isFunction(SCG.scenes.activeScene.afterMainWork)){
		SCG.scenes.activeScene.afterMainWork();	
	}

	if(SCG.gameLogics.isPausedStep)
	{
		SCG.gameLogics.isPausedStep =false;
	}

	SCG.frameCounter.doWork(now);
}
