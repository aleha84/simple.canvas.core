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

		this.scenes[scene.name] = {
			preMainWork : (scene.preMainWork !== undefined && isFunction(scene.preMainWork)) ? scene.preMainWork.bind(this) : undefined,
			afterMainWork : (scene.afterMainWork !== undefined && isFunction(scene.afterMainWork)) ? scene.afterMainWork.bind(this) : undefined,
			go: []
		};

		if(scene.initializer != undefined && isFunction(scene.initializer)){
			SCG.customInitializaers.push(scene.initializer);
		}

	}
}