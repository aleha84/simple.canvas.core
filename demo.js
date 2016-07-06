$(document).ready(function () {

	SCG.src = {
		flower_sheet: 'content/images/flower_sheet.png',
		butterfly_sheet: 'content/images/butterfly_sheet.png',
		grassBackground: 'content/images/grassBackground.png'
	}

	var scene1 = {
		name: "demo1",
		start: function(){
			this.go = [];
			var unit = SCG.GO.create("butterfly", {
				position: new Vector2(200, 200)
			});

			this.go.push(unit);

			this.go.push(SCG.GO.create("flower", {
				position: new Vector2(150, 150)
			}));

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
			clickHandler: function(clickPosition){
				this.playerUnit.setDestination(clickPosition);//.substract(this.playerUnit.size.division(2)));
			},
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
			// gos.push(SCG.GO.create("flower", {
			// 	position: new Vector2(150, 150)
			// }));

			// gos.push(SCG.GO.create("butterfly", {
			// 	position: new Vector2(200, 200)
			// }));

			return gos;
		}
	}	

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})