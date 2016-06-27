SCG.scenes = {
	activeScene: undefined,
	scenes: {},
	selectScene: function(sceneName){
		if(this.scenes[sceneName]==undefined){
			throw String.format('Scene {0} not found!', sceneName);
		}

		this.activeScene = this.scenes[sceneName];
	},
	registerScene: function(scene) {
		if(scene.name === undefined){
			throw "Can't register scene without name";
		}

		if(scene.gameObjectsBaseProperties != undefined && isArray(scene.gameObjectsBaseProperties))
		{
			for(var i = 0;i<scene.gameObjectsBaseProperties.length;i++){
				var type = scene.gameObjectsBaseProperties[i].type;
				if(SCG.GO.goBaseProperties[type] != undefined)
				{
					throw String.format("SCG.scenes.registerScene -> BaseProperty with type '{0} already registered'", type);
				}

				SCG.GO.register(type, scene.gameObjectsBaseProperties[i]);
			}
		}

		if(scene.initializer != undefined && isFunction(scene.initializer)){
			scene.initializer();

			//SCG.customInitializaers.push(scene.initializer);
		}

		this.scenes[scene.name] = {
			preMainWork : (scene.preMainWork !== undefined && isFunction(scene.preMainWork)) ? scene.preMainWork.bind(this) : undefined,
			afterMainWork : (scene.afterMainWork !== undefined && isFunction(scene.afterMainWork)) ? scene.afterMainWork.bind(this) : undefined,
			go: scene.gameObjectGenerator != undefined && isFunction(scene.gameObjectGenerator) ? scene.gameObjectGenerator() : []
		};

		

	}
}