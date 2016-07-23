document.addEventListener("DOMContentLoaded", function() {

	SCG.src = {

	}

	var scene1 = {
		name: "demo",
		start: function(){ // called each time as scene selected
			if(this.game.playerUnit == undefined){
				var unit = SCG.GO.create("simpleBox", {
					position: new Vector2(250, 150)
				});

				this.go.push(unit);

				this.game.playerUnit = unit;

				SCG.gameControls.camera.mode = 'centered';
			}


			SCG.gameControls.camera.centeredOn = this.game.playerUnit;
		},
		backgroundRender: function(){
			SCG.contextBg.beginPath();
			SCG.contextBg.rect(0, 0, SCG.viewfield.width, SCG.viewfield.width);
			SCG.contextBg.fillStyle ='gray';
			SCG.contextBg.fill()
		},
		preMainWork: function() {
			SCG.context.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
		},
		game: {
			playerUnit: undefined,
			clickHandler: function(clickPosition){ // custom global click handler
				if(SCG.gameControls.camera.mode === 'free')
				{
					var direction = undefined;
					if(clickPosition.x < 15*SCG.gameControls.scale.times){
						SCG.gameControls.camera.shifts.left = true;
					}
					else{
						SCG.gameControls.camera.shifts.left = false;	
					}
					if(clickPosition.x > (SCG.viewfield.default.width - 15*SCG.gameControls.scale.times)){
						SCG.gameControls.camera.shifts.right = true;
					}
					else{
						SCG.gameControls.camera.shifts.right = false;
					}
					if(clickPosition.y < 15*SCG.gameControls.scale.times){
						SCG.gameControls.camera.shifts.up = true;
					}
					else{
						SCG.gameControls.camera.shifts.up = false;
					}
					if(clickPosition.y > (SCG.viewfield.default.height - 15*SCG.gameControls.scale.times)){
						SCG.gameControls.camera.shifts.down = true;
					}
					else{
						SCG.gameControls.camera.shifts.down = false;
					}	
				}
				else if(SCG.gameControls.camera.mode === 'centered'){
					if(this.playerUnit){
						var shiftedCP = clickPosition.add(SCG.viewfield.current.topLeft);
						this.playerUnit.setDestination(shiftedCP);
					}
				}
			},
		},
		gameObjectsBaseProperties: [
			{ 
				type: 'simpleBox',
				size: new Vector2(20,20),
				speed: 1,
				isCustomRender: true,
				customRender: function() {
					SCG.context.beginPath();
					SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
					SCG.context.fillStyle ='green';
					SCG.context.fill()
				},
			},
			{ 
				type: 'line',
				size: new Vector2(1,1),
				isCustomRender: true,
				customRender: function() {
					SCG.context.beginPath();
					SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
					SCG.context.fillStyle ='red';
					SCG.context.fill()
				},
			}
		],
		gameObjectGenerator: function () {
			var gos = [];

			gos.push(SCG.GO.create("line", {
				position: new Vector2(0, 500),
				size: new Vector2(1,1000)
			}));

			gos.push(SCG.GO.create("line", {
				position: new Vector2(100, 500),
				size: new Vector2(1,1000)
			}));

			gos.push(SCG.GO.create("line", {
				position: new Vector2(200, 500),
				size: new Vector2(1,1000)
			}));

			gos.push(SCG.GO.create("line", {
				position: new Vector2(300, 500),
				size: new Vector2(1,1000)
			}));

			gos.push(SCG.GO.create("line", {
				position: new Vector2(500, 0),
				size: new Vector2(1000,1)
			}));			

			gos.push(SCG.GO.create("line", {
				position: new Vector2(500, 100),
				size: new Vector2(1000,1)
			}));			

			gos.push(SCG.GO.create("line", {
				position: new Vector2(500, 200),
				size: new Vector2(1000,1)
			}));			

			gos.push(SCG.GO.create("line", {
				position: new Vector2(500, 300),
				size: new Vector2(1000,1)
			}));			

			return gos;
		}
	}	


	//globals init
	SCG.space = {
		width: 1000,
		height: 1000
	}

	SCG.gameControls.camera.resetAfterUpdate = true;

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})