document.addEventListener("DOMContentLoaded", function() {

	SCG.src = {

	}

	var scene1 = {
		name: "demo_s1",
		space: {
			width: 1000,
			height: 1000
		},
		start: function(){ // called each time as scene selected
			if(this.game.playerUnit == undefined){
				var unit = SCG.GO.create("unit", {
					position: new Vector2(250, 150),
					size:new Vector2(50,50)
				});

				this.go.push(unit);

				this.game.playerUnit = unit;

				SCG.gameControls.camera.mode = 'centered';
			}

			SCG.gameControls.camera.preventModeSwitch = false;
			SCG.gameControls.camera.center(this.game.playerUnit);
			SCG.gameControls.camera.preventModeSwitch = true;
		},
		backgroundRender: function(){
			SCG.contextBg.beginPath();
			SCG.contextBg.rect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
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
				type: 'unit',
				size: new Vector2(20,20),
				speed: 1,
				imgPropertyName: 'unit',
				jumpOptions: {
					current: -1,
					start: -1,
					end: 1,
					step: 0.1
				},
				internalUpdate: function(){
					var jo = this.jumpOptions;
					if(this.renderPosition && (this.destination || (jo.current != -1 && jo.current <= jo.end))){
						this.renderPosition.y+= (-1* (Math.pow(jo.current,2)+1))*10;
					}
					else{
						return;
					}

					jo.current+=jo.step;
					if(jo.current > jo.end){
						jo.current = jo.start;
					}
				}
				// isCustomRender: true,
				// customRender: function() {
				// 	SCG.context.beginPath();
				// 	SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
				// 	SCG.context.fillStyle ='green';
				// 	SCG.context.fill()
				// },
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

	SCG.customInitializaers.push(function () {
		var unitCanvas = document.createElement('canvas');
		unitCanvas.width = 50;
		unitCanvas.height = 50;
		var unitCanvasContext = unitCanvas.getContext('2d');

		drawFigures(
			unitCanvasContext,
			[[
			new Vector2(20,11.5),new Vector2(30,11.5),{type:'curve', control: new Vector2(40,10), p: new Vector2(38.5,20)},
			new Vector2(38.5,30),{type:'curve', control: new Vector2(40,40), p: new Vector2(30,38.5)}, 
			new Vector2(20,38.5),{type:'curve', control: new Vector2(10,40), p: new Vector2(11.5,30)}, new Vector2(11.5,20),{type:'curve', control: new Vector2(10,10), p: new Vector2(20,11.5)}],
			[new Vector2(1,20),new Vector2(10,20),new Vector2(10,30),new Vector2(1,30),new Vector2(1,20)],
			[new Vector2(40,20),new Vector2(49,20),new Vector2(49,30),new Vector2(40,30),new Vector2(40,20)]],
		 	{alpha: 1, fill: 'white', stroke:'black'});
		unitCanvasContext.fillRect(19,20,2,2);
		unitCanvasContext.fillRect(29,20,2,2);
		unitCanvasContext.fillRect(20,25,10,2);

		SCG.images['unit'] = unitCanvas;
	})

	SCG.gameControls.camera.resetAfterUpdate = true;

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})