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
				var sword = SCG.GO.create("weapon", {
					position: new Vector2(5, 25),
					imgPropertyName: 'weapons',
				});


				var unit = SCG.GO.create("unit", {
					position: new Vector2(250, 150),
					size:new Vector2(50,50),
					items: {
						leftHand: sword
					}
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
				if(this.playerUnit){
					var shiftedCP = clickPosition.add(SCG.viewfield.current.topLeft);
					this.playerUnit.setDestination(shiftedCP);
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
				items: {},

				internalUpdate: function(){
					for (var key in this.items) {
					  if (this.items.hasOwnProperty(key)) {
					    this.items[key].update();
					  }
					}

					var jo = this.jumpOptions;
					if(this.renderPosition && (this.destination || (jo.current != -1 && jo.current <= jo.end))){
						this.renderPosition.y-= (-1*Math.pow(jo.current,2)+1)*10;
					}
					else{
						return;
					}

					jo.current+=jo.step;
					if(jo.current > jo.end){
						jo.current = jo.start;
					}
				},
				internalRender: function()
				{
					SCG.context.translate(this.renderPosition.x,this.renderPosition.y);

					for (var key in this.items) {
					  if (this.items.hasOwnProperty(key)) {
					    this.items[key].render();
					  }
					}

					SCG.context.translate(-this.renderPosition.x,-this.renderPosition.y);
				}
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
			},
			{
				type: 'weapon',
				size: new Vector2(10,50),
				damage: 1,
				rate: 1000,
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

		var weaponsCanvas = document.createElement('canvas');
		weaponsCanvas.width = 50;
		weaponsCanvas.height = 10;
		var weaponsCanvasContext = weaponsCanvas.getContext('2d');
		drawFigures(weaponsCanvasContext,
			[[new Vector2(0,20),new Vector2(5,5),new Vector2(10,20)]],
			{alpha: 1, fill: '#cd7f32', stroke:'#b87333'})

		SCG.images['weapons'] = unitCanvas;
	})

	SCG.gameControls.camera.resetAfterUpdate = true;

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})