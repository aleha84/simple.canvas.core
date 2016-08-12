SCG.scenes = {
	activeScene: undefined,
	scenes: {},
	selectScene: function(sceneName){
		if(this.scenes[sceneName]==undefined){
			throw String.format('Scene {0} not found!', sceneName);
		}

		if(this.activeScene && this.activeScene.dispose){
			this.activeScene.dispose();
		}

		this.activeScene = this.scenes[sceneName];

		var as = this.activeScene;
		// reset go event handlers
		SCG.gameControls.mousestate.eventHandlers.click = [];
		for(var i = 0, len = as.go.length; i < len;i++){
			var sg = as.go[i];
			if(sg.handlers.click){
				var eh = SCG.gameControls.mousestate.eventHandlers;
				if(eh.click.indexOf(sg) == -1){
					eh.click.push(sg);
				}
			}
		}

		//clean background
		if(SCG.contextBg){
			SCG.contextBg.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);

			if(as.backgroundRender != undefined && isFunction(as.backgroundRender)){
				as.backgroundRender();
			}	
		}

		// AI creation
		SCG.AI.initialize();

		// reset ui
		as.ui = [];
		if(SCG.globals.addDefaultUIButtons){
			SCG.UI.addDefaultUIButtons();
		}
		if(SCG.contextUI)
		{
			SCG.UI.invalidate();
		}

		SCG.space = {
			width: as.space.width,
			height: as.space.height
		};	

		if(as.start != undefined && isFunction(as.start)){
			as.start();
		}
	},
	registerScene: function(scene) {
		if(scene.name === undefined){
			throw "Can't register scene without name";
		}

		var bp = scene.gameObjectsBaseProperties;

		if(bp != undefined && isArray(bp))
		{
			for(var i = 0;i<bp.length;i++){
				var type = bp[i].type;
				if(SCG.GO.goBaseProperties[type] != undefined)
				{
					throw String.format("SCG.scenes.registerScene -> BaseProperty with type '{0} already registered'", type);
				}

				SCG.GO.register(type, bp[i]);
			}
		}

		this.scenes[scene.name] = {
			start : (scene.start !== undefined && isFunction(scene.start)) ? scene.start : undefined,
			dispose : (scene.dispose !== undefined && isFunction(scene.dispose)) ? scene.dispose : undefined,
			preMainWork : (scene.preMainWork !== undefined && isFunction(scene.preMainWork)) ? scene.preMainWork.bind(this) : undefined,
			afterMainWork : (scene.afterMainWork !== undefined && isFunction(scene.afterMainWork)) ? scene.afterMainWork.bind(this) : undefined,
			go: scene.gameObjectGenerator != undefined && isFunction(scene.gameObjectGenerator) ? scene.gameObjectGenerator() : [],
			backgroundRender: scene.backgroundRender != undefined && isFunction(scene.backgroundRender) ? scene.backgroundRender : undefined,
			game: extend(true, {}, scene.game),
			space: scene.space ? scene.space : { width: SCG.viewfield.default.width, height: SCG.viewfield.default.height },
			ui: [],
			unshift: []
		};

		

	}
}