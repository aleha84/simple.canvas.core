document.addEventListener("DOMContentLoaded", function() {

	SCG.src = {
		flower_sheet: 'content/images/flower_sheet.png',
		butterfly_sheet: 'content/images/butterfly_sheet.png',
		grassBackground: 'content/images/grassBackground.png'
	}

	var scene1 = {
		name: "demo1",
		start: function(){ // called each time as scene selected
			this.game.AI.initialize();

			this.go = [];
			var unit = SCG.GO.create("butterfly", {
				position: new Vector2(200, 200)
			});

			this.go.push(unit);

			this.game.playerUnit = unit;
		},
		backgroundRender: function(){
			if(SCG.images['grassBackground'] == undefined){
				return;
			}

			SCG.contextBg.drawImage(SCG.images['grassBackground'] , 
				0, 
				0, 
				SCG.viewfield.width, 
				SCG.viewfield.height)
		},
		preMainWork: function() {
			SCG.context.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
		},
		game: {
			playerUnit: undefined,
			clickHandler: function(clickPosition){ // custom global click handler
				this.playerUnit.setDestination(clickPosition);
			},
			AI: { // should be here if AI is needed
				initialize: function(){ // just helper to init environment
					SCG.AI.initializeEnvironment({
						space: {
							width: SCG.space.width,
							height: SCG.space.height
						},
						flowers: {
							items: [],
							maxCount: 5
						}
					});
				},
				messagesProcesser: function(wm){ // proccess messages from AI
					if(wm == undefined){
						return;
					}

					if(wm.command){
						switch(wm.command){
							case 'log':
								console.log(wm);
								break;
							case 'create':
								if(wm.message.goType == 'flower'){
									var isOk = false;
									var tryCount = 0;
									var maxTryCount = 10;
									var position = new Vector2(getRandomInt(15, SCG.space.width-15), getRandomInt(15, SCG.space.height-15));
									while(!isOk){
										if(tryCount > maxTryCount){
											break;
										}

										var toClose = false;
										for(var i = 0, len = SCG.scenes.activeScene.go.length;i<len;i++){
											var go = SCG.scenes.activeScene.go[i];
											if(position.distance(go.position) < go.size.x){
												tryCount++;
												position = new Vector2(getRandomInt(15, SCG.space.width-15), getRandomInt(15, SCG.space.height-15));
												toClose = true;
												break;		
											}
										}

										isOk = !toClose;
									}
									

									SCG.scenes.activeScene.go.push(SCG.GO.create("flower", {
										position: position
									}));
								}
								break;
							default:
								break;
						}	
					}
				},
				queueProcesser: function queueProcesser(){ // queue processer (on AI side)
					while(queue.length){
						var task = queue.pop();
						switch(task.type){
							case 'start':
								self.createFlower = function(){
									self.postMessage({command: 'create', message: { goType: 'flower' } });				
								};
								self.checkFlowers = function(){
									if(self.environment.flowers.items.length < self.environment.flowers.maxCount){
										self.createFlower();
									}
								};

								self.checkFlowers();
								break;
							case 'created':
								if(task.message.goType == 'flower'){
									self.environment.flowers.items.push({id: task.message.id, position: task.message.position });
									self.checkFlowers();
								}
								break;
							case 'removed':
								if(task.message.goType == 'flower'){
									var index = self.environment.flowers.items.map(function(item) { return item.id ;}).indexOf(task.message.id);
									if(index > -1){
										self.environment.flowers.items.splice(index, 1);
										self.checkFlowers();
									}
								}
								break;
							default:
								break;
						}
					}
					
				}
			}
		},
		gameObjectsBaseProperties: [
			{ 
				type: 'butterfly',
				size: new Vector2(20,20),
				speed: 2,
				imgPropertyName: 'butterfly_sheet',
				isAnimated: true,
				animation: {
					totalFrameCount: 34,
					framesInRow: 12,
					framesRowsCount: 3,
					frameChangeDelay: 50,
					destinationFrameSize: new Vector2(70,65),
					sourceFrameSize: new Vector2(70,65),
					loop: true,
				},
				internalUpdate: function(now){
					for(var i = 0, len = SCG.scenes.activeScene.go.length;i<len;i++){
						var goItem = SCG.scenes.activeScene.go[i];
						if(goItem.type == 'flower' && goItem.renderBox != undefined && goItem.renderBox.isPointInside(this.renderPosition)){
							goItem.setDead();
						}
					}
				}
			},
			{
				type:'flower',
				size: new Vector2(20,20),
				isOpened: false,
				isCustomRender: false,
				defaultDelay: 3000,
				isAnimated: true,
				imgPropertyName: 'flower_sheet',
				animation: {
					totalFrameCount: 17,
					framesInRow: 17,
					framesRowsCount: 1,
					frameChangeDelay: 50,
					destinationFrameSize: new Vector2(50,37),
					sourceFrameSize: new Vector2(50,37),
					loop: false,
					reverse: false,
					animationEndCallback: function() {
						this.animation.paused = true;
					}
				},
				customRender: function() {
					SCG.context.beginPath();
					SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
					SCG.context.fillStyle = this.isOpened? 'green': 'gray';
					SCG.context.fill()
				},
				openCloseSwitch: function(){
					this.isOpened = !this.isOpened;

					this.animation.paused = false;
					this.animation.reverse = this.isOpened;
				},
				internalPreUpdate: function(now) {
					doWorkByTimer(this.openCloseTimer, now);
				},
				initializer: function(that){
					if(that.openCloseTimer!= undefined){
						return;
					}

					that.openCloseTimer = {
						lastTimeWork: new Date,
						delta : 0,
						currentDelay: that.defaultDelay,
						originDelay: that.defaultDelay,
						doWorkInternal : that.openCloseSwitch,
						context: that
					}
				}
			}
		],
		gameObjectGenerator: function () {
			var gos = [];

			return gos;
		}
	}	


	//globals init
	SCG.space = {
		width: SCG.viewfield.default.width,
		height: SCG.viewfield.default.height
	}

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})