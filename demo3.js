document.addEventListener("DOMContentLoaded", function() {

	SCG.src = {

	}

	var scene1 = {
		name: "demo_s1",
		space: {
			width: 1000,
			height: 1000
		},
		dispose: function(){
			for(var i=0;i<this.game.intervals.length;i++){
				clearInterval(this.game.intervals[i]);
			}
		},
		start: function(){ // called each time as scene selected
			this.game.AI.initialize();
			var that = this;
			this.game.intervals.push(setInterval(
				function() {SCG.AI.sendEvent({type:'units', message: that.go.filter(function(el){return el.toPlain}).map(function(el) { return el.toPlain(); }) });}
				, 200));

			if(this.game.playerUnit == undefined){
				var sword = SCG.GO.create("item", {
					position: new V2(-20, 0),
					attackRadius: 10,
					damage: {min:1,max:5,crit:1},
					attackRate: 1000,
					renderSourcePosition : new V2(10,0),
					itemType: 'weapon'
				});

				var bow = SCG.GO.create("item", {
					position: new V2(-17.5, 0),
					renderSourcePosition : new V2(20,0),
					size:new V2(20,50),
					ranged: true,
					damage: {min:5,max:10,crit:10},
					attackRate: 1000,
					attackRadius: 200,
					itemType: 'weapon'
				});


				var unit = SCG.GO.create("unit", {
					position: new V2(250, 150),
					size:new V2(50,50),
					health: 1000,
				});
				unit.addItem(bow);
				this.go.push(unit);

				this.go.push(SCG.GO.create("unit", {
					position: new V2(150, 50),
					size:new V2(50,50),
					side: 2,
					health:1000,
					speed:0.5
				}));

				this.go.push(SCG.GO.create("unit", {
					position: new V2(400, 50),
					size:new V2(50,50),
					side: 2,
					health:1000,
					speed:0.5
				}));

				unit.selected = true;
				this.game.playerUnit = unit;

				SCG.gameControls.camera.mode = 'centered';
			}

			SCG.gameControls.camera.center(this.game.playerUnit);
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
			money: 0,
			playerUnit: undefined,
			clickHandler: function(clickPosition){ // custom global click handler
				if(this.playerUnit){
					var shiftedCP = clickPosition.add(SCG.viewfield.current.topLeft);
					this.playerUnit.setDestination(shiftedCP);
				}
			},
			intervals: [],
			AI: {
				initialize: function(){ // just helper to init environment
					SCG.AI.initializeEnvironment({
						space: {
							width: SCG.space.width,
							height: SCG.space.height
						},
						units: {
							ai: [],
							player: [],
							history: {}
						}
					});
				},
				messagesProcesser: function(wm){ // proccess messages from AI
					if(wm == undefined){
						return;
					}
					if(wm.command){
						switch(wm.command){
							case 'move':
								var as = SCG.scenes.activeScene;
								var unit = undefined;
								for(var i=0;i<as.go.length;i++){
									if(as.go[i].id == wm.message.id){
										as.go[i].setDestination(new V2(wm.message.position));
										break;
									}
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
						//console.log(task.type);
						switch(task.type){
							case 'start':
								self.helpers = {
									log: function(){
										console.log(self.environment)
									},
									move: function(id, position){
										self.postMessage({command: 'move', message: { id: id, position: position } });				
									}
								}

								break;
							case 'units':
								var eu = self.environment.units;
								for(var i =1;i<3;i++){
									eu[i==1?'player':'ai'] = task.message.filter(function(el){ return el.side == i}).map(function(el){  el.position = new V2(el.position); return el;});
								}

								var sh = self.helpers;
								if(sh == undefined || eu.player.length == 0){return;}
								var currentDestinations = [];
								for(var i = 0;i< eu.ai.length;i++){
									var aiUnit = eu.ai[i];

									//find closest player unit
									var distances = eu.player.map(function(el){ return { distance: aiUnit.position.distance(el.position),unit: el }});
									var closest = distances[0];
									if(distances.length>1){
										for(var j = 1;j<distances.length;j++){
											if(distances[j].distance < closest.distance){
												closest = distances[j];
											}
										}
									}
									
									//check history
									//if no history or this player unit moved, then reposition this ai unit
									var hUnit = eu.history[closest.unit.id];
									if(!hUnit || !hUnit.position.equal(closest.unit.position)){
										var playerPosition = closest.unit.position;
										var initialInvertedDirection = aiUnit.position.direction(playerPosition).mul(-1);
										var dir = initialInvertedDirection;
										var target = undefined;
										//if position is occupied (check by intersections with other ai units position) then rotate around player unit by clockwise
										for(var tryCount = 0;tryCount<20;tryCount++){
											target = playerPosition.add(dir.mul(0.8*aiUnit.range));
											if(currentDestinations.filter(function(el){ return boxIntersectsBox({center:target,size:aiUnit.size}, {center:el.dest, size: el.unit.size}); }).length == 0){
												break;
											}

											dir = initialInvertedDirection.rotate((Math.floor(tryCount/2) + 1)*10*(tryCount%2==0 ? 1 : -1),false,false);
										}


										currentDestinations.push({dest: target, unit: aiUnit});
										sh.move(aiUnit.id, target);
									}
								}

								// update history
								for(var puIndex = 0;puIndex<eu.player.length;puIndex++){
									eu.history[eu.player[puIndex].id] = eu.player[puIndex];
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
				type: 'unit',
				size: new V2(20,20),
				speed: 1,
				imgPropertyName: 'unit',
				jumpOptions: {
					current: -1,
					start: -1,
					end: 1,
					step: 0.1
				},
				items: {
					weapon : undefined,
					shield: undefined,
					armor: undefined,
					helmet: undefined,
				},
				level: 1,
				experience: 0,
				side: 1,
				health: 100,
				canAttack: true,
				defence: 1,
				damage: {min:2, max:5, crit:1},
				attackRadius: 20,
				attackRate: 500,
				stats: {
					str: 0,
					agl: 0,
					dex: 0,
					con: 0
				},
				initializer: function(that){
					that.attackRadius = that.size.x;

					that.attackDelayTimer = {
						lastTimeWork: new Date,
						delta : 0,
						currentDelay: 0,
						originDelay: 0,
						doWorkInternal : that.canAttackToggle,
						context: that
					}

					that.renderSourcePosition = new V2((that.side-1)*50,0);
				},
				handlers: {
					click: function(){
						if(this.side == 1){
							var as = SCG.scenes.activeScene;
							for(var i =0;i<as.go.length;i++){
								as.go[i].selected = false;
							}
							this.selected = true;
							as.game.playerUnit = this;
							SCG.gameControls.camera.center(as.game.playerUnit);
						}
						
						return {
							preventBubbling: true
						};
					}
				},
				getStats: function(type){
					var items = this.items;
					var weapon = items.weapon;
					switch(type){
						case 'attackRadius':
							return this.attackRadius + (weapon ? weapon.attackRadius : 0);
						case 'damage':
						var strenghtDamageModifier = 1+(0.2*this.stats.str);
							return { 
								min: (this.damage.min + (weapon ? weapon.damage.min : 0))*strenghtDamageModifier, 
								max: (this.damage.max + (weapon ? weapon.damage.max : 0))*strenghtDamageModifier, 
								crit: weapon ? weapon.damage.crit : this.damage.crit};
						case 'defence': 
							return (this.defence + (items.armor ? items.armor.defence : 0) 
												+ (items.helmet ? items.helmet.defence : 0))*(1+(0.2*this.stats.agl)); 
						case 'attackRate':
							return weapon ? weapon.attackRate : this.attackRate;
						case 'health':
							return this.health+(this.stats.con*20);
						case 'ranged':
							return (weapon && weapon.ranged ? weapon.ranged : false);
						default:
							break;
					}
				},
				toPlain: function(){
					return {
						id: this.id,
						position: this.position,
						health: this.getStats('health'),
						damage: this.getStats('damage'),
						side: this.side,
						range: this.getStats('attackRadius'),
						size: this.size
					}
				},
				canAttackToggle: function(){
					this.canAttack = !this.canAttack;
					this.attackDelayTimer.lastTimeWork = new Date;
					this.attackDelayTimer.currentDelay = this.getStats('attackRate');
				},
				receiveAttack: function(damage){
					damage-=this.getStats('defence');
					if(damage<=0){
						//show fading success damage
						return;
					}

					damage = parseFloat(damage.toFixed(1));

					SCG.scenes.activeScene.unshift.push(
						SCG.GO.create("fadingObject", {
							position: this.position.clone(),
							lifeTime: 1000,
							text: {
								size:12,
								color: '#ff2400',
								value: damage,
							},
							size: new V2(10,10),
							shift: new V2(0.15,-0.5)
						}));
					this.health-=damage;

					if(this.getStats('health') <= 0){
						this.setDead();
					}
				},
				beforeDead: function(){
					SCG.scenes.activeScene.go.push(
						SCG.GO.create("fadingObject", {
							position: this.position.clone(),
							imgPropertyName: 'actions',
							renderSourcePosition : new V2(250,0),
							size: new V2(50,50),
							lifeTime: 5000,
						}));
				},
				addItem: function(item){
					this.items[item.itemType] = item;
					
					if(item.itemType == 'weapon'){
						var ar = this.getStats('attackRate');
						this.attackDelayTimer.currentDelay = ar;
						this.attackDelayTimer.originDelay = ar;
					}
					
				},
				attack: function(target){
					var dir = this.position.substract(target.position);
					var shift=0;
					if(dir.x > 0){
						shift = 2;
					}
					if(dir.y < 0){
						shift++;
					}
					var damageObj = this.getStats('damage');
					var damage = getRandom(damageObj.min,damageObj.max)*(Math.random() < damageObj.crit/100 ? 3 : 1);
					if(!this.getStats('ranged')){
						SCG.scenes.activeScene.unshift.push(
							SCG.GO.create("fadingObject", {
								position: this.position.clone(),
								imgPropertyName: 'actions',
								renderSourcePosition : new V2(shift*50,0),
								size: new V2(50,50)
							}));	

						SCG.audio.start({notes: [{value:200,duration:0.7}],loop:false});
						SCG.audio.start({notes: [{value:1000,duration:0.3}],loop:false});

						target.receiveAttack(damage);
					}
					else{
						var direction = this.position.direction(target.position);
						var distance = this.position.distance(target.position);
						var path = [];
						for(var pi = 0;pi <10;pi++){//calculate pseudo-parabolic flight path
							var step = this.position.add(direction.mul((distance/10)*(pi+1)));
							step.y-=  ((-0.04*Math.pow(pi-5,2)+1)* distance/5);
							path.push(step);
						}
						SCG.scenes.activeScene.unshift.push(
							SCG.GO.create("projectile", {
								position: path.shift(),
								path: path,
								side: this.side,
								damage: damage
							}));
					}
					
					//SCG.audio.start({notes: [{value:207,duration:0.1},{value:307,duration:0.1}],loop:false,type:'square'});

					this.canAttackToggle();
				},
				internalUpdate: function(now){
					var that = this;
					Object.keys(this.items).forEach(function(key, index){
						that.items[key].update();
					});

					if(this.canAttack){
						var as = SCG.scenes.activeScene;
						var i = as.go.length;
						while (i--) {
							var go = as.go[i];
							if(go.type =='unit' && go.side != this.side && this.position.distance(go.position) < this.getStats('attackRadius')){
								this.attack(go);
								break;
							}
						}	
					}
					else{
						doWorkByTimer(this.attackDelayTimer, now);
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

					var that = this;
					Object.keys(this.items).forEach(function(key, index){
						that.items[key].render();
					});

					if(this.selected){
						SCG.context.drawImage(SCG.images['actions'], 
							200,
							0,
							50,
							50,
							0-this.renderSize.x/2, 
							0-this.renderSize.y/2, 
							this.renderSize.x, 
							this.renderSize.y);	
					}

					SCG.context.translate(-this.renderPosition.x,-this.renderPosition.y);
				}
			},
			{ 
				type: 'line',
				size: new V2(1,1),
				isCustomRender: true,
				customRender: function() {
					SCG.context.beginPath();
					SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
					SCG.context.fillStyle ='red';
					SCG.context.fill()
				},
			},
			{
				type: 'projectile',
				damage: 1,
				path: [],
				speed: 5,
				renderSourcePosition : new V2(40,0),
				imgPropertyName: 'items',
				size: new V2(10,25),
				setDeadOnDestinationComplete: true,
				angle: 0,
				beforeDead: function(){
					var as = SCG.scenes.activeScene;
					var that = this;
					var gos = as.go.filter(function(el){return el.type=='unit' && el.side && el.side != that.side && el.box.isPointInside(that.position)});
					for(var ui = 0;ui < gos.length;ui++){
						gos[ui].receiveAttack(this.damage);
					}
				},
				internalPreRender: function(){
					var ctx =SCG.context; 
					var rp = this.renderPosition;
					ctx.translate(rp.x,rp.y);
					if(this.direction && !this.direction.equal(new V2)){
						this.angle = V2.up().angleTo(this.direction,true);
						ctx.rotate(this.angle);	
					}
					ctx.translate(-rp.x,-rp.y);
				},
				internalRender: function(){
					var ctx =SCG.context; 
					var rp = this.renderPosition;
					ctx.translate(rp.x,rp.y);
					ctx.rotate(-this.angle);
					ctx.translate(-rp.x,-rp.y);
				},
			},
			{
				type: 'fadingObject',
				lifeTime: 500,
				alpha: 1,
				shift: undefined,
				text: undefined,
				initializer: function(that){
					if(that.text){
						that.isCustomRender = true;
					}
				},
				internalPreRender: function(){
					SCG.context.save();
					SCG.context.globalAlpha = this.alpha;
				},
				internalRender: function(){
					SCG.context.restore();
				},
				customRender: function(){
					var ctx = SCG.context;
					var t = this.text;
					ctx.font = t.renderSize+'px Arial';
					if(t.color){
						ctx.fillStyle = t.color;
					}
					ctx.fillText(t.value, this.renderPosition.x, this.renderPosition.y);
				},
				internalUpdate: function(now){
					this.alpha = 1 - (now - this.creationTime)/this.lifeTime;

					if(this.alpha <= 0){
						this.alive = false;
					}

					if(this.shift != undefined){
						this.position.add(this.shift,true);
					}

					if(this.text){
						this.text.renderSize = this.text.size* SCG.gameControls.scale.times;
					}
				}
			},
			{
				type: 'item',
				size: new V2(10,50),
				imgPropertyName: 'items',
				static: true
			}
		],
		gameObjectGenerator: function () {
			var gos = [];

			gos.push(SCG.GO.create("line", {
				position: new V2(0, 500),
				size: new V2(1,1000)
			}));

			gos.push(SCG.GO.create("line", {
				position: new V2(100, 500),
				size: new V2(1,1000)
			}));

			gos.push(SCG.GO.create("line", {
				position: new V2(200, 500),
				size: new V2(1,1000)
			}));

			gos.push(SCG.GO.create("line", {
				position: new V2(300, 500),
				size: new V2(1,1000)
			}));

			gos.push(SCG.GO.create("line", {
				position: new V2(500, 0),
				size: new V2(1000,1)
			}));			

			gos.push(SCG.GO.create("line", {
				position: new V2(500, 100),
				size: new V2(1000,1)
			}));			

			gos.push(SCG.GO.create("line", {
				position: new V2(500, 200),
				size: new V2(1000,1)
			}));			

			gos.push(SCG.GO.create("line", {
				position: new V2(500, 300),
				size: new V2(1000,1)
			}));			

			return gos;
		}
	}	

	SCG.customInitializaers.push(function () {
		var unitCanvas = document.createElement('canvas');
		unitCanvas.width = 100;
		unitCanvas.height = 50;
		var unitCanvasContext = unitCanvas.getContext('2d');
		var delta = 0;	
		for(var ui=0;ui<2;ui++){
			drawFigures(
				unitCanvasContext,
				[[
				new V2(20+delta,11.5),new V2(30+delta,11.5),{type:'curve', control: new V2(40+delta,10), p: new V2(38.5+delta,20)},
				new V2(38.5+delta,30),{type:'curve', control: new V2(40+delta,40), p: new V2(30+delta,38.5)}, 
				new V2(20+delta,38.5),{type:'curve', control: new V2(10+delta,40), p: new V2(11.5+delta,30)}, new V2(11.5+delta,20),{type:'curve', control: new V2(10+delta,10), p: new V2(20+delta,11.5)}],
				[new V2(1+delta,20),new V2(10+delta,20),new V2(10+delta,30),new V2(1+delta,30),new V2(1+delta,20)],
				[new V2(40+delta,20),new V2(49+delta,20),new V2(49+delta,30),new V2(40+delta,30),new V2(40+delta,20)]],
			 	{alpha: 1, fill: ui == 0? 'white': '#dcdcdc', stroke:'black'});
			unitCanvasContext.fillRect(19+delta,20,2,2);
			unitCanvasContext.fillRect(29+delta,20,2,2);
			unitCanvasContext.fillRect(20+delta,25,10,2);

			delta+=50;
		}
		

		SCG.images['unit'] = unitCanvas;

		var itemsCanvas = document.createElement('canvas');
		itemsCanvas.width = 50;
		itemsCanvas.height = 50;
		var itemsCanvasContext = itemsCanvas.getContext('2d');

		drawFigures(itemsCanvasContext, //dagger
			[[new V2(2.5,20),new V2(2.5,15),new V2(5,12.5),new V2(7.5,15),new V2(7.5,20)]],
			{alpha: 1, fill: '#cd7f32', stroke:'#b87333'})
		itemsCanvasContext.fillStyle = "#ffd700";
		itemsCanvasContext.fillRect(1.5,20,7,2);
		itemsCanvasContext.fillStyle = "#5b3a29";
		itemsCanvasContext.fillRect(3.5,22,3,3);
		delta = 10;
		drawFigures(itemsCanvasContext, //long sword
			[[new V2(2.5+delta,20),new V2(2.5+delta,5),new V2(5+delta,2.5),new V2(7.5+delta,5),new V2(7.5+delta,20)]],
			{alpha: 1, fill: '#cd7f32', stroke:'#b87333'})
		itemsCanvasContext.fillStyle = "#ffd700";
		itemsCanvasContext.fillRect(1.5+delta,20,7,2);
		itemsCanvasContext.fillStyle = "#5b3a29";
		itemsCanvasContext.fillRect(3.5+delta,22,3,3);
		var delta = 20;
		itemsCanvasContext.lineWidth=2;
		drawFigures(itemsCanvasContext, //bow
			[[new V2(15+delta,45),{type:'curve', control: new V2(0+delta,25), p: new V2(15+delta,5)}]],
			{alpha: 1, stroke:'#5b3a29'})
		itemsCanvasContext.lineWidth=1;
		drawFigures(itemsCanvasContext, //bow
			[[new V2(15+delta,45),new V2(15+delta,5)]],
			{alpha: 1, stroke:'#black'})
		delta = 40;
		drawFigures(itemsCanvasContext, //arrow
			[[new V2(3+delta,25),new V2(5+delta,22),new V2(7+delta,25)]],
			{alpha: 1, stroke:'#dc143c'});
		itemsCanvasContext.fillStyle = "#964b00";
		itemsCanvasContext.fillRect(4.5+delta,5,1,17);
		drawFigures(itemsCanvasContext,
			[[new V2(3+delta,7),new V2(5+delta,3),new V2(7+delta,7)]],
			{alpha: 1, stroke:'#c0c0c0'});

		SCG.images['items'] = itemsCanvas;

		var actionsCanvas = document.createElement('canvas');
		actionsCanvas.width = 300;
		actionsCanvas.height = 50;
		var actionsCanvasContext = actionsCanvas.getContext('2d');
		actionsCanvasContext.lineWidth=5;
		drawFigures(actionsCanvasContext, // right upper swing
			[[new V2(5,3),{type:'curve', control: new V2(50,0), p: new V2(45,47.5)}]],
			{alpha: 1, stroke:'#87cefa'})
		delta=50;
		drawFigures(actionsCanvasContext, // right bottom swing
			[[new V2(45+delta,5),{type:'curve', control: new V2(50+delta,50), p: new V2(5+delta,47)}]],
			{alpha: 1, stroke:'#87cefa'})
		delta=100;
		drawFigures(actionsCanvasContext, // left upper swing
			[[new V2(5+delta,47),{type:'curve', control: new V2(0+delta,0), p: new V2(45+delta,3)}]],
			{alpha: 1, stroke:'#87cefa'})
		delta=150;
		drawFigures(actionsCanvasContext, // left bottom swing
			[[new V2(45+delta,47),{type:'curve', control: new V2(0+delta,50), p: new V2(5+delta,3)}]],
			{alpha: 1, stroke:'#87cefa'})

		delta = 200;
		actionsCanvasContext.lineWidth=1;
		drawFigures(actionsCanvasContext, // select box
			[[new V2(1+delta,0),new V2(10+delta,0),new V2(1+delta,10)],
			[new V2(40+delta,0),new V2(49+delta,0),new V2(49+delta,10)],
			[new V2(49+delta,40),new V2(49+delta,50),new V2(40+delta,50)],
			[new V2(10+delta,50),new V2(1+delta,50),new V2(1+delta,40)]],
			{alpha: 1, fill:'#ffd700',stroke:'#998200'})
		delta = 250;
		drawFigures(actionsCanvasContext, // grave
			[[new V2(10+delta,40),new V2(10+delta,20),{type:'curve', control: new V2(25+delta,10), p: new V2(40+delta,20)},new V2(40+delta,40)]],
			{alpha: 1, fill:'#4b4d4b'})
		actionsCanvasContext.fillStyle = "#5da130";
		actionsCanvasContext.fillRect(5+delta,40,40,5);

		actionsCanvasContext.fillStyle = "#1b1116";
		actionsCanvasContext.fillRect(15+delta,25,20,5);

		actionsCanvasContext.fillStyle = "#1b1116";
		actionsCanvasContext.fillRect(15+delta,32,20,2);


		SCG.images['actions'] = actionsCanvas;
	})

	SCG.gameControls.camera.resetAfterUpdate = true;

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})