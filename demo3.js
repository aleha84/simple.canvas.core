document.addEventListener("DOMContentLoaded", function() {

	SCG.src = {

	}

	SCG.globals.items = [
		// { itemName: 'sword', position: new V2(-20, -7), attackRadius: 10, damage: {min:1,max:5,crit:1}, attackRate: 1000, destSourcePosition : new V2(10,0), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Fighter'] },
		// { itemName: 'bow', position: new V2(-17.5, 0), attackRadius: 200, damage: {min:5,max:10,crit:10}, attackRate: 1000, destSourcePosition : new V2(20,0), size:new V2(20,50), ranged: true, itemType: 'weapon', unitTypes: ['Ranged']  },
		// { itemName: 'shortBow', position: new V2(-20, 0), attackRadius: 100, damage: {min:2,max:5,crit:15}, attackRate: 750, destSourcePosition : new V2(50,0), size:new V2(20,50), ranged: true, itemType: 'weapon', unitTypes: ['Ranged']  }
	];

	SCG.globals.bgRender = function(){
		var ctx = SCG.contextBg;
		var viewfield = SCG.viewfield;
		ctx.beginPath();
		ctx.rect(0, 0, viewfield.width, viewfield.height);
		ctx.fillStyle ='gray';
		ctx.fill()
	};

	SCG.globals.modalClose = function(that, space, callback){
		that.ui.push(SCG.GO.create("button", {
			position: new V2(space.width*0.95, space.height*0.05),
			size: new V2(50,30),
			text: {value: "Close", color:'red', autoSize:true,font:'Arial'},
			handlers: {
				click: function(){
					callback();
					return {
						preventBubbling: true
					};
				}
			}
		}));
	};

	var scene1 = {
		name: "demo_s1",
		space: {
			width: 500,
			height: 300
		},
		dispose: function(){
			for(var i=0;i<this.game.intervals.length;i++){
				clearInterval(this.game.intervals[i]);
			}
		},
		start: function(props){ // called each time as scene selected
			var game = this.game;
			game.AI.initialize(props.level);
			var that = this;
			game.intervals.push(setInterval(
				function() {SCG.AI.sendEvent({type:'units', message: that.go.filter(function(el){return el.toPlain}).map(function(el) { return el.toPlain(); }) });}
				, 200));

			if(props.fromManagement){
				this.go = props.gos;
				this.game.money = props.money;
			}

			this.go.filter(function(el){ return el.side == 1; }).forEach(function(el,i){
				el.regClick();
			});	

			//if(game.playerUnit == undefined){
				// var sword = SCG.GO.create("item", {
				// 	position: new V2(-20, 0),
				// 	attackRadius: 10,
				// 	damage: {min:1,max:5,crit:1},
				// 	attackRate: 1000,
				// 	destSourcePosition : new V2(10,0),
				// 	itemType: 'weapon'
				// });

				// var bowDescr = SCG.globals.items.filter(function(el) { return el.itemName == 'shortBow' })[0];

				// var bow = SCG.GO.create("item",
				// 	bowDescr
				// );


				// var unit = SCG.GO.create("unit", {
				// 	position: new V2(250, 150),
				// 	size:new V2(50,50),
				// 	health: 1000,
				// 	unitType: 'Ranged'
				// });
				// // unit.addItem(bow);
				// this.go.push(unit);

				// this.go.push(SCG.GO.create("unit", {
				// 	position: new V2(150, 50),
				// 	size:new V2(50,50),
				// 	side: 2,
				// 	health:1000,
				// 	speed:0.5
				// }));

				// this.go.push(SCG.GO.create("unit", {
				// 	position: new V2(400, 50),
				// 	size:new V2(50,50),
				// 	side: 2,
				// 	health:1000,
				// 	speed:0.5
				// }));

				// unit.selected = true;
				// game.playerUnit = unit;

				// SCG.gameControls.camera.mode = 'centered';

				// testing
				//SCG.scenes.selectScene(scene2.name, {money: 1000, fromBattle: true, gos: this.go.filter(function(el){return el.side == 1})});
			//}

			//SCG.gameControls.camera.center(game.playerUnit);
		},
		backgroundRender: function(){
			var ctx = SCG.contextBg;
			var viewfield = SCG.viewfield;
			ctx.beginPath();
			ctx.rect(0, 0, viewfield.width, viewfield.height);
			ctx.fillStyle ='gray';
			ctx.fill()
		},
		preMainWork: function() {
			var viewfield = SCG.viewfield;
			SCG.context.clearRect(0, 0, viewfield.width, viewfield.height);
		},
		game: {
			money: 0,
			playerUnit: undefined,
			clickHandler: function(clickPosition){ // custom global click handler
				var pu = this.playerUnit;
				if(pu){
					var shiftedCP = clickPosition.add(SCG.viewfield.current.topLeft);
					pu.setDestination(shiftedCP);

					var cSize = new V2(Math.abs(pu.position.x-  shiftedCP.x), Math.abs(pu.position.y-  shiftedCP.y));
					// if(cSize.x < 50){cSize.x = 50;}
					// if(cSize.y < 50){cSize.y = 50;}

					var corner = pu.position.x <= shiftedCP.x ? 0 : 1;
					if(shiftedCP.y < pu.position.y){ corner+=2; }

					var canvas = document.createElement('canvas');
					canvas.width = cSize.x;
					canvas.height = cSize.y;
					var p1, p2, p3;
					switch(corner){
						case 0: 
							p1 = new V2(pu.size.x/2, 0);
							p2 = new V2(0, pu.size.y/2);
							p3 = new V2(cSize.x, cSize.y);
							break;
						case 1: 
							p1 = new V2(cSize.x - pu.size.x/2, 0);
							p2 = new V2(cSize.x, pu.size.y/2);
							p3 = new V2(0, cSize.y);
							break;
						case 2: 
							p1 = new V2(0, cSize.y - pu.size.y/2);
							p2 = new V2(pu.size.x/2, cSize.y);
							p3 = new V2(cSize.x, 0);
							break;
						case 3: 
							p1 = new V2(cSize.x - pu.size.x/2, cSize.y);
							p2 = new V2(cSize.x, cSize.y - pu.size.y/2);
							p3 = new V2(0, 0);
							break;
						default:
							break;
					}
					var ctx = canvas.getContext('2d');
					drawFigures(ctx, 
						[[p1,p2,p3]],
						{alpha: 1, fill: 'blue'});

					var position =pu.position.add(pu.position.direction(shiftedCP).normalize().mul(pu.position.distance(shiftedCP)/2));

					SCG.scenes.activeScene.go.push(
						SCG.GO.create("fadingObject", {
							position: position,
							lifeTime: 300,
							img : canvas,
							size: cSize,
						}));
				}
			},
			intervals: [],
			AI: {
				initialize: function(level){ // just helper to init environment
					SCG.AI.initializeEnvironment({
						space: {
							width: SCG.space.width,
							height: SCG.space.height
						},
						units: {
							ai: [],
							player: [],
							history: {}
						},
						level : level
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
									},
									create: function(level, type, items){
										self.postMessage({command: 'create', message: { type: type, level: level, items: items } });		
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
					armor: undefined,
					helmet: undefined,
					shield: undefined
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
				unitType: 'Fighter',
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

					that.destSourcePosition = new V2((that.side-1)*50,0);
					var stats = that.stats;
					switch(that.unitType){
						case 'Fighter':
							stats.str = 2;
							stats.con = 1;
							break;
						case 'Defender':
							stats.agl = 2;
							stats.con = 1;
							break;
						case 'Ranged':
							stats.con = 2;
							stats.str = 1;
							stats.agl = 1;
							break;
						default:
							throw 'Unknown unit type';
					}
				},
				handlers: {
					click: function(){
						if(this.side == 1){
							var as = SCG.scenes.activeScene;
							for(var i =0;i<as.go.length;i++){
								as.go[i].selected = false;
							}
							this.selected = true;
							if(as.name =='management'){
								as.game.unitSelected(this);
							}
							else{
								as.game.playerUnit = this;
								SCG.gameControls.camera.center(as.game.playerUnit);	
							}
							
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
								min: parseFloat(((this.damage.min + (weapon ? weapon.damage.min : 0))*strenghtDamageModifier).toFixed(1)), 
								max: parseFloat(((this.damage.max + (weapon ? weapon.damage.max : 0))*strenghtDamageModifier).toFixed(1)), 
								crit: weapon ? weapon.damage.crit : this.damage.crit};
						case 'defence': 
							return parseFloat(((this.defence + (items.armor ? items.armor.defence : 0) 
												+ (items.helmet ? items.helmet.defence : 0)
												+ (items.shield ? items.shield.defence : 0))*(1+(0.2*this.stats.agl))).toFixed(1)); 
						case 'attackRate':
							return weapon ? weapon.attackRate : this.attackRate;
						case 'health':
							return this.health+(this.stats.con*20);
						case 'ranged':
							return (weapon && weapon.ranged ? weapon.ranged : false);
						case 'expCap':
							return Math.pow(this.level,2)*100;
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
					var defence = this.getStats('defence');
					damage-=defence;
					if(damage<=0){
						damage = Math.random() < (1/((defence-damage)*1.5) ? damage / 3 : 0);
						if(damage<=0){
							return;
						}
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
							destSourcePosition : new V2(250,0),
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
								destSourcePosition : new V2(shift*50,0),
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
					Object.keys(this.items).sort().forEach(function(key, index){
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
				destSourcePosition : new V2(250,60),
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
		// gameObjectGenerator: function () {
		// 	var gos = [];

		// 	gos.push(SCG.GO.create("line", {
		// 		position: new V2(0, 500),
		// 		size: new V2(1,1000)
		// 	}));

		// 	gos.push(SCG.GO.create("line", {
		// 		position: new V2(100, 500),
		// 		size: new V2(1,1000)
		// 	}));

		// 	gos.push(SCG.GO.create("line", {
		// 		position: new V2(200, 500),
		// 		size: new V2(1,1000)
		// 	}));

		// 	gos.push(SCG.GO.create("line", {
		// 		position: new V2(300, 500),
		// 		size: new V2(1,1000)
		// 	}));

		// 	gos.push(SCG.GO.create("line", {
		// 		position: new V2(500, 0),
		// 		size: new V2(1000,1)
		// 	}));			

		// 	gos.push(SCG.GO.create("line", {
		// 		position: new V2(500, 100),
		// 		size: new V2(1000,1)
		// 	}));			

		// 	gos.push(SCG.GO.create("line", {
		// 		position: new V2(500, 200),
		// 		size: new V2(1000,1)
		// 	}));			

		// 	gos.push(SCG.GO.create("line", {
		// 		position: new V2(500, 300),
		// 		size: new V2(1000,1)
		// 	}));			

		// 	return gos;
		// }
	}

	var scene2 = {
		name: "management",
		space: {
			width: 500,
			height: 300
		},
		dispose: function(){
		},
		start: function(props){ // called each time as scene selected
			var sc = this.game.selectedUnit.statsControls;
			if(!sc.initialized){
				sc.initialize();
			}

			var that = this;
			if(props.fromBattle){
				this.go = props.gos;
				this.game.money = props.money;
			}
			else if(props.fromUTSelect && props.type){
				this.go.push(SCG.GO.create("unit", {
					position: new V2,
					size:new V2(50,50),
					health: 100,
					unitType: props.type 
				}));
			}
			
			// render player units
			var selectedUnit = undefined;
			this.go.forEach(function(el,i){
				el.position = new V2(el.size.x/2,(el.size.y/2)+i*50);
				if(!props.fromItemSelect){
					el.selected =  false;	
				}
				el.regClick();
				that.ui.push(SCG.GO.create("label", { position: new V2(el.position.x + el.size.x/4, el.position.y-el.size.y/4),size: new V2(el.size.x/2,el.size.y/2), text: { size: 25, color:'green', value: el.unitType.substring(0,1) } }));
			});	

			if(this.go.length<6){
				for(var i = this.go.length;i<7;i++){
					(function(index){
						that.ui.push(SCG.GO.create("button", {
							position: new V2(25,25+index*50),
							text: {value:'HIRE',autoSize:true,font:'Arial'},
							handlers: {
								click: function(){
									SCG.scenes.selectScene(scene3.name);
									return {
										preventBubbling: true
									};
								}
							}
						}));
					})(i);
				}
			}

			//register scene labels and buttons
			var labels = this.game.selectedUnit.statsControls.labels;
			Object.keys(labels).forEach(function(el){
				that.ui.push(labels[el]);
			});

			var buttons = this.game.selectedUnit.statsControls.buttons;
			Object.keys(buttons).forEach(function(el){
				that.ui.push(buttons[el]);
			});

			that.ui.push(SCG.GO.create("image", { position: new V2(230, 220),size: new V2(150,150), destSourcePosition : new V2(0,0), destSourceSize: new V2(50,50), imgPropertyName: 'unit'}));

			that.ui.push(SCG.GO.create("button", { position: new V2(this.space.width-150, 50), size: new V2(70,40), text: {value:'Play',autoSize:true,font:'Arial'},handlers: {
				click: function(){
					if(that.go.length == 0){
						alert('You have no units to play!');
						return;
					}
					SCG.scenes.selectScene(scene1.name, {fromManagement: true, gos: that.go, money: that.game.money});
					return {
						preventBubbling: true
					};
				}
			}}));

			if(!props.fromItemSelect){
				this.game.selectedUnit.unit = undefined;
			}
			else{
				var unit = this.game.selectedUnit.unit;
				if(props.item){
					unit.addItem(SCG.GO.create("item",
						props.item
					));
				}
				
				this.game.unitSelected(this.game.selectedUnit.unit);
			}

			SCG.UI.invalidate();
		},
		backgroundRender: function(){
			SCG.globals.bgRender();
		},
		preMainWork: function() {
			SCG.context.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
		},
		game: {
			money: 0,
			selectedUnit: {
				unit: undefined,
				statsControls:
				{
					initialized: false,
					initialize: function(){
						var that =this;

						[{n:'hp', p: new V2(110, 50), color: 'Red', f: 'Health: {0}' },
							{n:'str', p: new V2(110, 70),  f: 'Strenght: {0}' },
							{n:'agl', p: new V2(110, 90),  f: 'Agility: {0}' },
							{n:'con', p: new V2(110, 110),  f: 'Constitution: {0}' },
							{n:'rte', p: new V2(110, 130), s:200, f: 'Attack rate: {0}' },
							
							{n:'lvl', p: new V2(250, 50), color: 'Blue', f: 'Level: {0}'},
							{n:'exp', p: new V2(250, 70), s:200, f: 'Experience: {0}' },
							{n:'atk', p: new V2(250, 90),  s:200, f: 'Attack: {0}' },
							{n:'def', p: new V2(250, 110), f: 'Defence: {0}' },
							{n:'rng', p: new V2(250, 130), f: 'Range: {0}'}].forEach(function(el){
								that.labels[el.n] = SCG.GO.create("label", 
									{ position: el.p,size: new V2(el.s ? el.s : 100,30), text: { size: 15, color:el.color ? el.color : 'Black', value: 0, format:el.f } });
							});

						
						 [{n: 'wpn', p: new V2(170, 220), s: new V2(40,120), it: 'weapon'},
							{n: 'shd', p: new V2(295, 220), s: new V2(50,120), it: 'shield'},
							{n: 'hlm', p: new V2(230, 185), s: new V2(80,50), it: 'helmet'},
							{n: 'arm', p: new V2(230, 235), s: new V2(80,50), it: 'armor'}].forEach(function(el){
							that.buttons[el.n] = SCG.GO.create("button", { position: el.p,size: el.s, border:true, useInnerCanvas: false, 
								handlers: { 
									click: function(){ 
										var unit = SCG.scenes.activeScene.game.selectedUnit.unit;
										if(!SCG.scenes.activeScene.game.selectedUnit.unit){
											alert('No selected unit');	
										}
										else{
											SCG.scenes.selectScene(scene4.name, {unitType: unit.unitType, itemType: el.it});
										}
										return {
											preventBubbling: true
										};
									}
								 } 
							});
						});
					},
					labels: {

					},
					buttons: {

					}
				}
			},
			unitSelected: function(unit){
				this.selectedUnit.unit = unit;
				var labels = this.selectedUnit.statsControls.labels;
				labels.hp.text.value = unit.health;
				labels.str.text.value = unit.stats.str;
				labels.agl.text.value = unit.stats.agl;
				labels.con.text.value = unit.stats.con;

				labels.lvl.text.value = unit.level;
				labels.exp.text.value = String.format("{0}-{1}",unit.experience, unit.getStats('expCap'));
				var atk = unit.getStats('damage');
				labels.atk.text.value = String.format("{0}-{1}({2}%)", atk.min, atk.max,atk.crit);
				labels.def.text.value = unit.getStats('defence');
				labels.rng.text.value = unit.getStats('attackRadius');
				labels.rte.text.value = unit.getStats('attackRate');

				var buttons = this.selectedUnit.statsControls.buttons;
				if(unit.items.weapon){
					buttons.wpn.img = unit.items.weapon.img;
					buttons.wpn.destSourcePosition = unit.items.weapon.destSourcePosition;
					buttons.wpn.destSourceSize = unit.items.weapon.size;
				}
				else{
					buttons.wpn.img = undefined;
				}

				if(unit.items.shield){
					buttons.shd.img = unit.items.shield.img;
					buttons.shd.destSourcePosition = unit.items.shield.destSourcePosition;
					buttons.shd.destSourceSize = unit.items.shield.size;
				}
				else{
					buttons.shd.img = undefined;
				}

				if(unit.items.helmet){
					buttons.hlm.img = unit.items.helmet.img;
					buttons.hlm.destSourcePosition = unit.items.helmet.destSourcePosition;
					buttons.hlm.destSourceSize = unit.items.helmet.size;
				}
				else{
					buttons.hlm.img = undefined;
				}

				if(unit.items.armor){
					buttons.arm.img = unit.items.armor.img;
					buttons.arm.destSourcePosition = unit.items.armor.destSourcePosition;
					buttons.arm.destSourceSize = unit.items.armor.size;
				}
				else{
					buttons.arm.img = undefined;
				}
				

				SCG.UI.invalidate();
			}
		}
	}

	var scene3 = 	{
		name: "ut_select",
		space: {
			width: SCG.viewfield.default.width,
			height: SCG.viewfield.default.height
		},
		start: function(props){
			var that = this;
			var space = this.space;
			var shifts = new V2(space.width*0.1, space.height*0.15);
			SCG.globals.modalClose(that, space, function(){ SCG.scenes.selectScene(scene2.name, {fromUTSelect: true, type: undefined}); });

			var types = ['Fighter', 'Defender', 'Ranged'];
			var itemSize = new V2((space.width*0.8)/types.length,space.height*0.7);

			types.forEach(function(el,i){
				that.ui.push(SCG.GO.create("button", {
					position: new V2(shifts.x +  itemSize.x/2 + itemSize.x*i,shifts.y + itemSize.y/2),
					size: itemSize,
					text: {value: el, autoSize:true,font:'Arial'},
					handlers: {
						click: function(){
							SCG.scenes.selectScene(scene2.name, {fromUTSelect: true, type: el});
							return {
								preventBubbling: true
							};
						}
					}
				}));
			})

			var viewfield = SCG.viewfield;
			SCG.context.clearRect(0, 0, viewfield.width, viewfield.height);
			SCG.UI.invalidate();
			
		},
		preMainWork: function() {
			SCG.context.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
		},
		backgroundRender: function(){
			SCG.globals.bgRender();
		},
	}

	var scene4 = {
		name: "item_select",
		space: {
			width: SCG.viewfield.default.width,
			height: SCG.viewfield.default.height
		},
		start: function(props){
			var that = this;
			var space = this.space;
			var itemSize = new V2((space.width*0.8)/3,(space.height*0.7)/3);
			var shifts = new V2(space.width*0.1, space.height*0.15);
			var globals = SCG.globals;

			globals.modalClose(that, space, function(){ SCG.scenes.selectScene(scene2.name, {fromItemSelect: true, item: undefined}); });

			globals.items.filter(function(el){ return el.itemType == props.itemType && el.unitTypes.indexOf(props.unitType) != -1}).forEach(function(el,i){
				var row = parseInt(i/3);
				var column = i-row*3;
				var btnPosition = new V2(shifts.x+ itemSize.x/2 + itemSize.x*column, shifts.y+ itemSize.y/2 + itemSize.y*row );

				that.ui.push(SCG.GO.create("button", {
					position: btnPosition,
					size: itemSize,
					text: {value: "", autoSize:true,font:'Arial'},
					handlers: {
						click: function(){
							SCG.scenes.selectScene(scene2.name, {fromItemSelect: true, item: el});
							return {
								preventBubbling: true
							};
						}
					}
				}));

				var scaled = el.size.mul(itemSize.y / el.size.y);
				var imgShiftedPosition = btnPosition.substract(new V2(itemSize.x/2 - scaled.x/2 - itemSize.x*0.05),0);
				var lablesTop = btnPosition.substract(new V2(-15, itemSize.y/2));
				var labelSize = new V2(100,itemSize.y/4);
				that.ui.push(SCG.GO.create("image", { position: imgShiftedPosition,size: scaled, destSourcePosition : el.destSourcePosition, destSourceSize: el.size, imgPropertyName: 'items'}));
				that.ui.push(SCG.GO.create("label", { position: lablesTop.add(new V2(0, labelSize.y/2)),size: labelSize, text: { color:'Red', value: 0, format: 'Price: {0}' } }));
				switch(el.itemType){
					case 'weapon':
						that.ui.push(SCG.GO.create("label", { position: lablesTop.add(new V2(0, 1.5*labelSize.y)),size: labelSize, text: { size: 10, value: String.format("Damage {0}-{1}({2}%)", el.damage.min, el.damage.max,el.damage.crit)} }));
						that.ui.push(SCG.GO.create("label", { position: lablesTop.add(new V2(0, 2.5*labelSize.y)),size: labelSize, text: { size: 10, value: el.attackRate, format: 'Rate: {0}'} }));
						that.ui.push(SCG.GO.create("label", { position: lablesTop.add(new V2(0, 3.5*labelSize.y)),size: labelSize, text: { size: 10, value: el.attackRadius, format: 'Range: {0}'} }));
						break
					case 'shield':
					case 'armor':
					case 'helmet':
						that.ui.push(SCG.GO.create("label", { position: lablesTop.add(new V2(0, 1.5*labelSize.y)),size: labelSize, text: { size: 10, value: el.defence, format: 'Defence: {0}'} } ));
						break
				}
				
			});

			
			var viewfield = SCG.viewfield;
			SCG.context.clearRect(0, 0, viewfield.width, viewfield.height);
			SCG.UI.invalidate();
			
		},
		preMainWork: function() {
			SCG.context.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
		},
		backgroundRender: function(){
			SCG.globals.bgRender();
		},
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
		itemsCanvas.width = 90;
		itemsCanvas.height = 750;
		var itemsCanvasContext = itemsCanvas.getContext('2d');
		delta = 0;
		var deltay= 0;

		var fillColors = ["#cd7f32", "#f2f2f2", "#baacc7"];
		var strokeColors = ["#b87333", "#c0c0c0", "#876f9e"];
		var materialNames = ["bronze", "steel", "mithril"];

		for(var i = 0;i<3;i++){
			drawFigures(itemsCanvasContext, //sword
				[[new V2(2.5+delta,30),new V2(2.5+delta,15),new V2(5+delta,12.5),new V2(7.5+delta,15),new V2(7.5+delta,30)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]})
			itemsCanvasContext.fillStyle = "#ffd700";
			itemsCanvasContext.fillRect(1.5+delta,30,7,2);
			itemsCanvasContext.fillStyle = "#5b3a29";
			itemsCanvasContext.fillRect(3.5+delta,32,3,3);
			SCG.globals.items.push({ itemName: materialNames[i] + ' sword', position: new V2(-20, -7), attackRadius: 10, damage: {min:1*(i+1),max:5*(i+1),crit:5}, attackRate: 1000, destSourcePosition : new V2(delta,0), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Fighter'] });
			
			deltay = 50;
			drawFigures(itemsCanvasContext, //axe
				[[new V2(7.5+delta,20+deltay),new V2(5+delta,22.5+deltay),{type:'curve', control: new V2(1.5+delta,17.5+deltay), p: new V2(5+delta,12.5+deltay)},new V2(7.5+delta,15+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = "#5b3a29";
			itemsCanvasContext.fillRect(7+delta,15+deltay,1.5,20);
			SCG.globals.items.push({ itemName: materialNames[i] + ' axe', position: new V2(-20, -7), attackRadius: 5, damage: {min:5*(i+1),max:15*(i+1),crit:2}, attackRate: 1500, destSourcePosition : new V2(delta,deltay), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Fighter'] });

			deltay = 100;
			drawFigures(itemsCanvasContext, //spear
				[[new V2(5+delta,0+deltay), new V2(7+delta,5+deltay),new V2(5+delta,10+deltay),new V2(3+delta,5+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = "#5b3a29";
			itemsCanvasContext.fillRect(4+delta,10+deltay,1.5,35);
			SCG.globals.items.push({ itemName: materialNames[i] + ' spear', position: new V2(-20, -0), attackRadius: 25, damage: {min:1*(i+1),max:15*(i+1),crit:15}, attackRate: 1500, destSourcePosition : new V2(delta,deltay), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Defender'] });

			deltay = 150;
			drawFigures(itemsCanvasContext, //halbert
				[[new V2(5+delta,0+deltay), new V2(7+delta,5+deltay),new V2(5+delta,10+deltay),new V2(3+delta,5+deltay)],
				[new V2(9+delta, 12.5+deltay),new V2(2.5+delta, 10+deltay),{type:'curve', control: new V2(0+delta,15+deltay), p: new V2(3.5+delta,20+deltay)}]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = "#5b3a29";
			itemsCanvasContext.fillRect(4+delta,17+deltay,1.5,30);
			SCG.globals.items.push({ itemName: materialNames[i] + ' halbert', position: new V2(-20, -0), attackRadius: 25, damage: {min:5*(i+1),max:35*(i+1),crit:15}, attackRate: 2500, destSourcePosition : new V2(delta,deltay), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Defender'] });
			delta+=10;
		}
		delta = 0;
		for(var i = 0;i<3;i++){
			deltay = 200;
			itemsCanvasContext.lineWidth=2;
			drawFigures(itemsCanvasContext, //shortbow
				[[new V2(15+delta,35+deltay),{type:'curve', control: new V2(5+delta,25+deltay), p: new V2(15+delta,15+deltay)}]],
				{alpha: 1, stroke:strokeColors[i]})
			itemsCanvasContext.lineWidth=1;
			drawFigures(itemsCanvasContext, //shortbow
				[[new V2(15+delta,35+deltay),new V2(15+delta,15+deltay)]],
				{alpha: 1, stroke:'#black'})
			SCG.globals.items.push({ itemName: materialNames[i] + 'shortBow', position: new V2(-20, 0), attackRadius: 100, damage: {min:2*(i+1),max:5*(i+1),crit:15}, attackRate: 750, destSourcePosition : new V2(delta,deltay), size:new V2(20,50), ranged: true, itemType: 'weapon', unitTypes: ['Ranged']  });
			
			deltay = 250;
			itemsCanvasContext.lineWidth=2;
			drawFigures(itemsCanvasContext, //bow
				[[new V2(15+delta,45+deltay),{type:'curve', control: new V2(0+delta,25+deltay), p: new V2(15+delta,5+deltay)}]],
				{alpha: 1, stroke:strokeColors[i]})
			itemsCanvasContext.lineWidth=1;
			drawFigures(itemsCanvasContext, //bow
				[[new V2(15+delta,45+deltay),new V2(15+delta,5+deltay)]],
				{alpha: 1, stroke:'#black'})
			SCG.globals.items.push({ itemName: materialNames[i] +' bow', position: new V2(-17.5, 0), attackRadius: 200, damage: {min:5*(i+1),max:10*(i+1),crit:10}, attackRate: 1000, destSourcePosition : new V2(delta,deltay), size:new V2(20,50), ranged: true, itemType: 'weapon', unitTypes: ['Ranged']  });

			delta += 20;
		}
		
		drawFigures(itemsCanvasContext, //arrow
			[[new V2(3+delta,25+deltay),new V2(5+delta,22+deltay),new V2(7+delta,25+deltay)]],
			{alpha: 1, stroke:'#dc143c'});
		itemsCanvasContext.fillStyle = "#964b00";
		itemsCanvasContext.fillRect(4.5+delta,5+deltay,1,17);
		drawFigures(itemsCanvasContext,
			[[new V2(3+delta,7+deltay),new V2(5+delta,3+deltay),new V2(7+delta,7+deltay)]],
			{alpha: 1, stroke:'#c0c0c0'});

		delta = 0;
		for(var i = 0;i<3;i++){
			deltay = 300;
			itemsCanvasContext.fillStyle = fillColors[i];
			itemsCanvasContext.strokeStyle = strokeColors[i];
			itemsCanvasContext.beginPath();
			itemsCanvasContext.arc(15+delta, 25+deltay, 6, 0, 2 * Math.PI);
			itemsCanvasContext.fill();
			itemsCanvasContext.stroke();
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.beginPath();
			itemsCanvasContext.arc(15+delta, 25+deltay, 2, 0, 2 * Math.PI);
			itemsCanvasContext.fill();
			SCG.globals.items.push({ itemName: materialNames[i] +' small_shield', position: new V2(17, 0), defence: 5*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'shield', unitTypes: ['Fighter']  });

			deltay = 350;
			drawFigures(itemsCanvasContext, //middle shield
				[[new V2(15+delta,15+deltay),new V2(22.5+delta,20+deltay), {type:'curve', control: new V2(23+delta,32+deltay), p: new V2(15+delta,35+deltay)},{type:'curve', control: new V2(7+delta,32+deltay), p: new V2(7.5+delta,20+deltay)}]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			drawFigures(itemsCanvasContext, //middle shield
				[[new V2(11+delta,21+deltay),new V2(19+delta,21+deltay),new V2(15+delta,30+deltay) ]],
				{alpha: 1, fill: strokeColors[i]});
			SCG.globals.items.push({ itemName: materialNames[i] +' medium_shield', position: new V2(17, 0), defence: 10*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'shield', unitTypes: ['Fighter', 'Defender']  });

			deltay = 400;
			drawFigures(itemsCanvasContext, //large_shield
				[[new V2(5+delta,5+deltay),new V2(25+delta,5+deltay),new V2(25+delta,45+deltay),new V2(5+delta,45+deltay),new V2(5+delta,5+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.fillRect(10+delta,10+deltay,10,30);
			SCG.globals.items.push({ itemName: materialNames[i] +' large_shield', position: new V2(17, 0), defence: 15*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'shield', unitTypes: ['Defender']  });

			deltay = 450;
			drawFigures(itemsCanvasContext, //small helmet
				[[new V2(2+delta,25+deltay),{type:'curve', control: new V2(15+delta,10+deltay), p: new V2(28+delta,25+deltay)},new V2(2+delta,25+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			SCG.globals.items.push({ itemName: materialNames[i] +' small_helmet', position: new V2(0, -13), defence: 5*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'helmet', unitTypes: ['Ranged', 'Fighter']  });

			deltay = 500;
			drawFigures(itemsCanvasContext, //medium_helmet
				[[new V2(2+delta,25+deltay),{type:'curve', control: new V2(15+delta,10+deltay), p: new V2(28+delta,25+deltay)},new V2(2+delta,25+deltay)],
				[new V2(2+delta,25+deltay), new V2(2+delta,35+deltay),new V2(10+delta,25+deltay)],
				[new V2(28+delta,25+deltay), new V2(28+delta,35+deltay),new V2(20+delta,25+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			SCG.globals.items.push({ itemName: materialNames[i] +' medium_helmet', position: new V2(0, -13), defence: 10*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'helmet', unitTypes: ['Fighter', 'Defender']  });

			deltay = 550;
			drawFigures(itemsCanvasContext, //full_helmet
				[[new V2(2+delta,25+deltay),{type:'curve', control: new V2(15+delta,10+deltay), p: new V2(28+delta,25+deltay)},new V2(2+delta,25+deltay)],
				[new V2(2+delta,25+deltay), new V2(2+delta,35+deltay),new V2(7+delta,35+deltay),{type:'curve', control: new V2(15+delta,30+deltay), p: new V2(23+delta,35+deltay)},new V2(28+delta,35+deltay),new V2(28+delta,25+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			SCG.globals.items.push({ itemName: materialNames[i] +' full_helmet', position: new V2(0, -13), defence: 15*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'helmet', unitTypes: ['Defender']  });

			deltay = 600;
			drawFigures(itemsCanvasContext, //armor
				[[new V2(2+delta,20+deltay),new V2(28+delta,30+deltay)],
				[new V2(2+delta,30+deltay),new V2(28+delta,20+deltay)]],
				{alpha: 1, stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.fillRect(10+delta,22+deltay,10,6);
			SCG.globals.items.push({ itemName: materialNames[i] +' light_armor', position: new V2(0, 8), defence: 5*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'armor', unitTypes: ['Ranged', 'Fighter']  });


			deltay = 650;
			drawFigures(itemsCanvasContext, //armor
				[[new V2(2+delta,20+deltay),{type:'curve', control: new V2(15+delta,23+deltay), p: new V2(28+delta,20+deltay)},new V2(28+delta,28+deltay),{type:'curve', control: new V2(15+delta,25+deltay), p: new V2(2+delta,28+deltay)},new V2(2+delta,20+deltay)]],
				{alpha: 1, fill: fillColors[i],stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.fillRect(4+delta,23+deltay,22,2);
			SCG.globals.items.push({ itemName: materialNames[i] +' medium_armor', position: new V2(0, 8), defence: 10*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'armor', unitTypes:['Fighter', 'Defender']   });

			deltay = 700;
			drawFigures(itemsCanvasContext, //armor
				[[new V2(2+delta,16+deltay),{type:'curve', control: new V2(15+delta,21+deltay), p: new V2(28+delta,16+deltay)},new V2(28+delta,30+deltay),{type:'curve', control: new V2(15+delta,32+deltay), p: new V2(2+delta,30+deltay)},new V2(2+delta,16+deltay)]],
				{alpha: 1, fill: fillColors[i],stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.fillRect(4+delta,23+deltay,22,2);
			SCG.globals.items.push({ itemName: materialNames[i] +' full_armor', position: new V2(0, 8), defence: 15*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'armor', unitTypes:['Defender']   });


			delta += 30;
		}

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
	SCG.scenes.registerScene(scene2);
	SCG.scenes.registerScene(scene3);
	SCG.scenes.registerScene(scene4);

	//SCG.scenes.selectScene(scene1.name);
	SCG.scenes.selectScene(scene2.name, {money: 1000, fromBattle: true, gos: []});

	SCG.start();
})