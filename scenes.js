SCG.scenes = {
	activeScene: undefined,
	scenes: {},
	selectScene: function(sceneName){
		if(this.scenes[sceneName]==undefined){
			throw String.format('Scene {0} not found!', sceneName);
		}

		this.activeScene = this.scenes[sceneName];

		// reset go event handlers
		SCG.gameControls.mousestate.eventHandlers.click = [];
		for(var i = 0, len = this.activeScene.go.length; i < len;i++){
			var sg = this.activeScene.go[i];
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

			if(this.activeScene.backgroundRender != undefined && isFunction(this.activeScene.backgroundRender)){
				this.activeScene.backgroundRender();
			}	
		}

		// AI creation
		SCG.AI.initialize();

		// reset ui
		this.activeScene.ui = [];
		if(SCG.globals.addDefaultUIButtons){
			SCG.UI.addDefaultUIButtons();
		}
		if(SCG.contextUI)
		{
			SCG.UI.invalidate();
		}

		if(this.activeScene.start != undefined && isFunction(this.activeScene.start)){
			this.activeScene.start();
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
			preMainWork : (scene.preMainWork !== undefined && isFunction(scene.preMainWork)) ? scene.preMainWork.bind(this) : undefined,
			afterMainWork : (scene.afterMainWork !== undefined && isFunction(scene.afterMainWork)) ? scene.afterMainWork.bind(this) : undefined,
			go: scene.gameObjectGenerator != undefined && isFunction(scene.gameObjectGenerator) ? scene.gameObjectGenerator() : [],
			backgroundRender: scene.backgroundRender != undefined && isFunction(scene.backgroundRender) ? scene.backgroundRender : undefined,
			game: extend(true, {}, scene.game),
			ui: []
		};

		

	}
}