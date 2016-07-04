$(document).ready(function () {
	var scene1 = {
		name: "demo1",
		backgroundRender: function(){
			SCG.contextBg.beginPath();
			SCG.contextBg.rect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
			SCG.contextBg.fillStyle = 'yellow';
			SCG.contextBg.fill();
		},
		preMainWork: function() {
			SCG.context.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
		},
		gameObjectsBaseProperties: [
			{ 
				type: 'demoObject',
				size: new Vector2(10,10),
				isCustomRender: true,
				customRender: function() {
					SCG.context.beginPath();
					SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
					SCG.context.fillStyle = 'gray';
					SCG.context.fill()
				},
				clickHandler: function(){
					alert(this.id);
				},
				handlers: {
					click: true
				}
			},
			{
				type:'flower',
				size: new Vector2(20,20),
				isOpened: false,
				isCustomRender: true,
				defaultDelay: 3000,
				customRender: function() {
					SCG.context.beginPath();
					SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
					SCG.context.fillStyle = this.isOpened? 'green': 'gray';
					SCG.context.fill()
				},
				openCloseSwitch: function(){
					this.isOpened = !this.isOpened;
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
			gos.push(SCG.GO.create("flower", {
				position: new Vector2(150, 150)
			}));

			// gos.push(SCG.GO.create("demoObject", {
			// 	position: new Vector2(300, 200),
			// 	size: new Vector2(20,20)
			// }));

			return gos;
		}
	}	

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})