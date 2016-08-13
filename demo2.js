document.addEventListener("DOMContentLoaded", function() {

	SCG.src = {

	}

	var scene2 = {
		name: "demo_s2",
		space: {
			width: 500,
			height: 300
		},
		start: function () {
			SCG.gameControls.camera.preventModeSwitch = false;
			SCG.gameControls.camera.free();
			SCG.viewfield.current.update(new Vector2);
			SCG.gameControls.camera.preventModeSwitch = true;
		},
		backgroundRender: function(){
			SCG.contextBg.beginPath();
			SCG.contextBg.rect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
			SCG.contextBg.fillStyle ='lightgreen';
			SCG.contextBg.fill()
		},
		preMainWork: function() {
			SCG.context.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
		},
		gameObjectGenerator: function () {
			var gos = [];

			gos.push(SCG.GO.create("line", {
				position: new Vector2(250, 150),
				size: new Vector2(1,300)
			}));

			gos.push(SCG.GO.create("line", {
				position: new Vector2(250, 150),
				size: new Vector2(500,1)
			}));

			return gos;
		}
	}


	var scene1 = {
		name: "demo_s1",
		space: {
			width: 1000,
			height: 1000
		},
		start: function(){ // called each time as scene selected
			if(this.game.playerUnit == undefined){
				var unit = SCG.GO.create("simpleBox", {
					position: new Vector2(250, 150)
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


	// //globals init
	// SCG.space = {
	// 	width: 1000,
	// 	height: 1000
	// }
	var n = SCG.audio.notes;
	//requem lower
	SCG.audio.start({notes: [
		{value: [n.o2.g,n.o1.g],duration: n.dur._1},
		{value: [n.o2.g,n.o3.g],duration: n.dur._1},
		{value: [n.o2.e,n.o3.e],duration: n.dur._2},
		{value: [n.o2.d,n.o3.d],duration: n.dur._2},
		{value: [n.o2.g,n.o3.g],duration: n.dur._1},
		{value: [n.o2.e,n.o3.e],duration: n.dur._2},
		{value: [n.o2.d,n.o3.d],duration: n.dur._2},
		{value: [n.o2.g,n.o3.g],duration: n.dur._1},
		{value: [n.o2.e,n.o2.h,n.o3.e],duration: n.dur._2},
		{value: [n.o2.d,n.o2.a,n.o3.d],duration: n.dur._2},

		{value: [n.o2.g,n.o3.g],duration: n.dur._1},
		{value: [n.o2.e,n.o2.h,n.o3.e],duration: n.dur._2},
		{value: [n.o2.d,n.o2.a,n.o3.d],duration: n.dur._2},
		{value: [n.o2.g,n.o2.h,n.o3.g],duration: n.dur._4},
		{value: n.o2.h,duration: n.dur._4},
		{value: n.o2.h,duration: n.dur._4},
		{value: n.o2.h,duration: n.dur._4},

		{value: [n.o2.e,n.o2.h,n.o3.e],duration: n.dur._4},
		{value: n.o2.h,duration: n.dur._4},
		{value: [n.o2.d,n.o2.h,n.o3.d],duration: n.dur._4},
		{value: n.o2.h,duration: n.dur._4},
		{value: [n.o2.g,n.o2.h,n.o3.d,n.o3.g],duration: n.dur._4},
		{value: [n.o2.g,n.o2.h,n.o3.d],duration: n.dur._4},
		{value: [n.o2.g,n.o2.h,n.o3.d],duration: n.dur._4},
		{value: [n.o2.g,n.o2.h,n.o3.d],duration: n.dur._4},
		{value: [n.o2.e,n.o2.g,n.o2.h,n.o3.e],duration: n.dur._4},
		{value: [n.o2.e,n.o2.g,n.o2.h],duration: n.dur._4},
		{value: [n.o2.d,n.o2.f_sh,n.o2.a,n.o3.d],duration: n.dur._4},
		{value: [n.o2.d,n.o2.f,n.o2.a,n.o3.d],duration: n.dur._4},

		{value: [n.o2.g,n.o3.d,n.o3.g],duration: n.dur._4},
		{value: [n.o2.g,n.o3.d],duration: n.dur._4},
		{value: [n.o2.g,n.o3.d],duration: n.dur._4},
		{value: [n.o2.g,n.o3.d],duration: n.dur._4},
		{value: [n.o2.e,n.o2.h,n.o3.e],duration: n.dur._4},
		{value: [n.o2.e,n.o2.h],duration: n.dur._4},
		{value: [n.o2.d,n.o2.a,n.o3.d],duration: n.dur._4},
		{value: [n.o2.d,n.o2.a],duration: n.dur._4},
		{value: [n.o2.g,n.o3.d,n.o3.g],duration: n.dur._4},
		{value: [n.o2.g,n.o3.d],duration: n.dur._4},
		{value: [n.o2.g,n.o3.d],duration: n.dur._4},
		{value: [n.o2.g,n.o3.d],duration: n.dur._4},

		{value: [n.o2.e,n.o2.h,n.o3.e],duration: n.dur._4},
		{value: [n.o2.e,n.o2.h],duration: n.dur._4},
		{value: [n.o2.d,n.o2.f_sh,n.o2.a,n.o3.d],duration: n.dur._8},
		{value: [n.o2.f,n.o2.a,n.o3.d,n.o3.f_sh],duration: n.dur._8},
		{value: [n.o2.a,n.o3.d,n.o3.f,n.o3.a],duration: n.dur._8},
		{value: [n.o3.d,n.o3.f,n.o3.a, n.o4.d],duration: n.dur._8},
		{value: [n.o1.g,n.o2.g],duration: n.dur._4},
		{value: [n.o3.d,n.o3.g,n.o3.h],duration: n.dur._4},
		{value: [n.o1.g,n.o2.g],duration: n.dur._4},
		{value: [n.o3.d,n.o3.g,n.o3.h],duration: n.dur._4},
		{value: [n.o1.e,n.o2.e],duration: n.dur._4},
		{value: [n.o3.e,n.o3.g,n.o3.h,n.o4.e],duration: n.dur._4},
		{value: [n.o1.d,n.o2.d],duration: n.dur._4},
		{value: [n.o3.d,n.o3.f_sh,n.o3.a,n.o4.d],duration: n.dur._4},

		{value: [n.o1.g,n.o2.g],duration: n.dur._4},
		{value: [n.o3.d,n.o3.g,n.o3.h],duration: n.dur._4},
		{value: [n.o1.g,n.o2.g],duration: n.dur._4},
		{value: [n.o3.d,n.o3.g,n.o3.h],duration: n.dur._4},
		{value: [n.o1.e,n.o2.e],duration: n.dur._4},
		{value: [n.o3.e,n.o3.g,n.o3.h,n.o4.e],duration: n.dur._4},
		{value: [n.o1.d,n.o2.d],duration: n.dur._4},
		{value: [n.o3.d,n.o3.f_sh,n.o3.a,n.o4.d],duration: n.dur._4},

		{value: [n.o1.g,n.o2.g],duration: n.dur._16},
		{value: [n.o1.g,n.o2.g],duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o2.g,n.o3.d,n.o3.g],duration: n.dur._16},
		{value: [n.o2.g,n.o3.d,n.o3.g],duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o1.g,n.o2.g],duration: n.dur._16},
		{value: [n.o1.g,n.o2.g],duration: n.dur._16},
		{value: [n.o1.g,n.o2.g],duration: n.dur._16},
		{value: [n.o1.g,n.o2.g],duration: n.dur._16},
		{value: [n.o2.g,n.o3.d,n.o3.g],duration: n.dur._16},
		{value: [n.o2.g,n.o3.d,n.o3.g],duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o1.e,n.o2.e],duration: n.dur._16},
		{value: [n.o1.e,n.o2.e],duration: n.dur._16},
		{value: [n.o1.e,n.o2.e],duration: n.dur._16},
		{value: [n.o1.e,n.o2.e],duration: n.dur._16},
		{value: [n.o2.e,n.o2.h,n.o3.e],duration: n.dur._16},
		{value: [n.o2.e,n.o2.h,n.o3.e],duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o1.d,n.o2.d],duration: n.dur._16},
		{value: [n.o1.d,n.o2.d],duration: n.dur._16},
		{value: [n.o1.d,n.o2.d],duration: n.dur._16},
		{value: [n.o1.d,n.o2.d],duration: n.dur._16},
		{value: [n.o2.d,n.o2.a,n.o3.d],duration: n.dur._16},
		{value: [n.o2.d,n.o2.a,n.o3.d],duration: n.dur._16},

		{value: [n.o2.g,n.o3.g],duration: n.dur._1},
		{value: [n.o2.e,n.o3.e],duration: n.dur._2},
		{value: [n.o2.d,n.o3.d],duration: n.dur._2},
		{value: [n.o2.g,n.o3.g],duration: n.dur._1},
		{value: [n.o2.e,n.o3.e],duration: n.dur._2},
		{value: [n.o2.d,n.o3.d],duration: n.dur._2},
		{value: [n.o1.g,n.o2.g],duration: n.dur._1},
		],
		loop:true, length:4000,maxVol:0.1});
	SCG.audio.start({notes: [
		//requem upper
		{value: n.pause,duration: n.dur._1},
		{value: n.pause,duration: n.dur._1},
		{value: n.pause,duration: n.dur._1},
		{value: n.pause,duration: n.dur._1},
		{value: n.pause,duration: n.dur._1},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o6.c,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},

		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o6.c,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},

		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o6.c,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},
		{value: n.o5.d,duration: n.dur._8},
		{value: n.o6.c,duration: n.dur._8},
		{value: n.o5.h,duration: n.dur._8},
		{value: n.o5.a,duration: n.dur._8},
		{value: n.o5.g,duration: n.dur._8},

		{value: [n.o4.d,n.o4.h],duration: n.dur._8},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.pause,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._16},
		{value: [n.o4.d,n.o4.h],duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._16},
		{value: [n.o4.e,n.o4.h],duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._16},
		{value: [n.o4.d,n.o4.h],duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._16},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._16},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._16},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.g,duration: n.dur._16},
		{value: [n.o4.d,n.o4.h],duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._16},
		{value: [n.o4.d,n.o4.h],duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._16},

		{value: [n.o4.e,n.o4.h],duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._16},
		{value: [n.o4.d,n.o4.h],duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._16},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._16},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._16},
		{value: n.o4.h,duration: n.dur._16},
		{value: n.o4.a,duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._8},
		{value: [n.o4.g,n.o5.g],duration: n.dur._8},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},

		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: n.pause,duration: n.dur._16},
		{value: n.pause,duration: n.dur._8},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.a],duration: n.dur._16},

		{value: [n.o4.h,n.o5.d,n.o5.g,n.o5.h],duration: n.dur._8},
		{value: [n.o4.a,n.o5.d,n.o5.g,n.o5.a],duration: n.dur._8},
		{value: [n.o4.g,n.o4.h,n.o5.d,n.o5.g],duration: n.dur._8},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.h,n.o5.d,n.o5.g,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.d,n.o5.g,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.d,n.o5.g,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.d,n.o5.g,n.o5.a],duration: n.dur._16},
		{value: [n.o4.g,n.o4.h,n.o5.d,n.o5.g],duration: n.dur._8},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.h,n.o5.h],duration: n.dur._16},
		{value: [n.o4.h,n.o5.d,n.o5.g,n.o5.h],duration: n.dur._16},
		{value: [n.o4.a,n.o5.e,n.o5.g,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.e,n.o5.g,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.e,n.o5.g,n.o5.a],duration: n.dur._16},
		{value: [n.o4.g,n.o4.h,n.o5.e,n.o5.g],duration: n.dur._8},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.g,n.o5.g],duration: n.dur._16},
		{value: [n.o4.g,n.o5.e,n.o5.g],duration: n.dur._16},
		{value: [n.o4.a,n.o5.d,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.d,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.d,n.o5.a],duration: n.dur._16},
		{value: [n.o4.a,n.o5.d,n.o5.f_sh,n.o5.a],duration: n.dur._16},
		{value: [n.o4.h,n.o5.d,n.o5.f,n.o5.h],duration: n.dur._16},
		{value: [n.o4.h,n.o5.d,n.o5.f,n.o5.h],duration: n.dur._16},
		{value: [n.o4.h,n.o5.d,n.o5.f,n.o5.h],duration: n.dur._16},

		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.o4.d,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.o4.d,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.o4.d,duration: n.dur._8},
		{value: n.o5.c,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.o4.d,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.o4.d,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.o4.g,duration: n.dur._8},
		{value: n.o4.d,duration: n.dur._8},
		{value: n.o5.c,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.a,duration: n.dur._8},
		{value: n.o4.h,duration: n.dur._8},
		{value: n.o4.g,duration: n.dur._1},

		//friends
		// {value: n.o4.g, duration: n.dur._4},
		// {value: n.o4.e, duration: n.dur._4},
		// {value: n.o4.a, duration: n.dur._2},
		// {value: n.o4.g, duration: n.dur._2},
		// {value: n.o4.d, duration: n.dur._4},
		// {value: n.o4.f, duration: n.dur._4},
		// {value: n.o4.e, duration: n.dur._4},
		// {value: n.o4.d, duration: n.dur._4},
		// {value: n.o4.c, duration: n.dur._1},
		// {value: n.o4.c, duration: n.dur._4},
		// 	//{value: n.pause, duration: n.dur._4}, 
		// {value: n.o4.e, duration: n.dur._4},
		// {value: n.o4.g, duration: n.dur._4},
		// {value: n.o4.a, duration: n.dur._4},
		// {value: n.o4.a, duration: n.dur._4},
		// {value: n.o4.a, duration: n.dur._4},
		// {value: n.o4.h, duration: n.dur._4},
		// {value: n.o5.d, duration: n.dur._4},
		// {value: n.o5.c, duration: n.dur._4},
		// {value: n.o4.h, duration: n.dur._4},
		// {value: n.o4.a, duration: n.dur._4},
		// {value: n.o5.c, duration: n.dur._2},
		// {value: n.o4.g, duration: n.dur._2},
		// {value: n.o4.g, duration: n.dur._4},
		// 	//{value: n.pause, duration: n.dur._4}, 
		// {value: n.o4.a, duration: n.dur._4},
		// {value: n.o4.h, duration: n.dur._4},
		// {value: n.o5.c, duration: n.dur._2},
		// {value: n.o4.h, duration: n.dur._4},
		// {value: n.o4.a, duration: n.dur._4},
		// {value: n.o4.e, duration: n.dur._4},
		// {value: n.o4.g, duration: n.dur._4},
		// {value: n.o4.f, duration: n.dur._4},
		// {value: n.o4.a, duration: n.dur._1},
		// {value: n.o4.a, duration: n.dur._4},

		//coca-cola
		// {value: n.o1.e, duration: n.dur.quarter},
		// {value: n.o1.c, duration: n.dur.quarter},
		// {value: n.o1.d, duration: n.dur.quarter},
		// {value: n.o1.e, duration: n.dur.quarter},
		// {value: n.o1.c, duration: n.dur.half},

		// {value: n.o1.g, duration: n.dur.quarter},
		// {value: n.o1.f, duration: n.dur.quarter},
		// {value: n.o1.e, duration: n.dur.quarter},
		// {value: n.o1.d, duration: n.dur.quarter},

		// {value: n.o1.e, duration: n.dur.quarter},
		// {value: n.o1.c, duration: n.dur.quarter},
		// {value: n.o1.d, duration: n.dur.quarter},
		// {value: n.o1.e, duration: n.dur.quarter},
		// {value: n.o1.c, duration: n.dur.whole},

		//{value: n.pause, duration: n.dur.half},
	],
loop:true, length:4000});

	//SCG.audio.start({notes: [{value: n.o5.h, duration: n.dur._1},{value: n.o5.a, duration: n.dur._1},{value: n.o5.h, duration: n.dur._1},], loop:false});

	SCG.gameControls.camera.resetAfterUpdate = true;

	SCG.scenes.registerScene(scene1);
	SCG.scenes.registerScene(scene2);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})