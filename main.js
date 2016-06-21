SCG.start = function(){
	if(!SCG.canvas)
	{
		var c = $('<canvas />',{
			width: SCG.viewfield.width,
			height: SCG.viewfield.height
		});
		c.attr({'width':SCG.viewfield.width,'height':SCG.viewfield.height,id:SCG.canvasId});
		$(document.body).append(c);
		SCG.canvas = c.get(0);
		SCG.context = SCG.canvas.getContext('2d');

		// var fulsscreenToggleButton = $('<div />',
		// 	{
		// 		class: 'button fulscreenbutton',
		// 		on: {
		// 			click: function(){ screenfull.toggle(document.documentElement); $(this).toggleClass('exit'); }
		// 		}
		// 	});

		// $(document.body).append(fulsscreenToggleButton);
		//SCG.debugger.setValue('App started');
	}

	SCG.initializer(function(){
		SCG.gameControls.orientationChangeEventInit();

		SCG.customInitialization();

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
	

	var i = SCG.go.length;
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
