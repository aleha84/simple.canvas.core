document.addEventListener("DOMContentLoaded", function() {

	SCG.src = {

	}

	var globals = SCG.globals;

	globals.items = [

	];

	globals.bgRender = function(props){
		var color = 'gray';
		if(props){
			if(props.color){
				color = props.color;
			}
		}
		var ctx = SCG.contextBg;
		var viewfield = SCG.viewfield;
		ctx.beginPath();
		ctx.rect(0, 0, viewfield.width, viewfield.height);
		ctx.fillStyle = color;
		ctx.fill()
	};

	globals.clearBg = function(){
		SCG.context.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
	}

	globals.modalClose = function(that, space, callback){
		that.ui.push(globals.cb( {
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

	globals.create = function(name, lProps){
		return SCG.GO.create(name, lProps);
	}
	globals.cl = function(lProps){
		return globals.create("label", lProps);
	}
	globals.cfo = function(lProps){
		return globals.create("fadingObject", lProps);
	}
	globals.cb = function(lProps){
		return globals.create("button", lProps);
	}


	globals.unitTypes = ['Fighter', 'Defender', 'Ranged'];
	globals.itemTypes = ['weapon', 'shield', 'helmet', 'armor'];
	globals.materialTypes = ["bronze", "steel", "mithril"];
	globals.attributes = ['str', 'agl',  'con'];

	

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
			game.level = props.level;
			var that = this;
			game.intervals.push(setInterval(
				function() {SCG.AI.sendEvent({type:'units', message: that.go.filter(function(el){return el.toPlain}).map(function(el) { return el.toPlain(); }) });}
				, 200));

			if(props.fromManagement){
				this.go = props.gos;
				game.money = props.money;
			}

			this.go.filter(function(el){ return el.side == 1; }).forEach(function(el,i){
				el.regClick();
				el.selected = false;
			});	

			var labelSize = new V2(100,20);
			var moneyLabel = globals.cl({ position: new V2(100,10),size: labelSize, text: { size: 10, value: game.money, color: 'gold', format: 'Money: {0}'} });
			game.labels.money = moneyLabel;
			this.ui.push(moneyLabel);

			this.ui.push(globals.cl( { position: new V2(200,10),size: labelSize, text: { size: 10, value: game.level, color: 'orange', format: 'Wave level: {0}'} }));

			
			SCG.UI.invalidate();
		},
		backgroundRender: function(){
			globals.bgRender();
		},
		preMainWork: function() {
			globals.clearBg();
		},
		game: {
			money: 0,
			level: 1,
			playerUnit: undefined,
			labels: {
				money: undefined
			},
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
						globals.cfo( {
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
						level : level,
						waveProps : {
							created: 0, 
							max: level*5,
							atOnce: level+1
						}
					});
				},
				messagesProcesser: function(wm){ // proccess messages from AI
					if(wm == undefined){
						return;
					}
					if(wm.command){
						var as = SCG.scenes.activeScene;
						var msg = wm.message;
						switch(wm.command){
							case 'move':
								var unit = undefined;
								for(var i=0;i<as.go.length;i++){
									if(as.go[i].id == msg.id){
										as.go[i].setDestination(new V2(msg.position));
										break;
									}
								}
								break;
							case 'gameOver':
								SCG.scenes.selectScene(gameOverScene.name);
								break;
							case 'waveEnd': 
								as.unshift.push(
									globals.cfo( {
										position: new V2(as.space.width/2-150, as.space.height/2),
										lifeTime: 5000,
										text: {
											size:50,
											color: 'RED',
											value: "BATTLE WIN",
										},
										size: new V2(as.space.width,as.space.height),
										shift: new V2(0,-0.5)
									}));

								setTimeout(function(){
									SCG.scenes.selectScene(scene2.name, {money: as.game.money, fromBattle: true, level: as.game.level+1, gos: as.go.filter(function(el){return el.side == 1 && el.type == 'unit'})});	
								},5000)
								
								break;
							case 'create':
								var unitType = globals.unitTypes[msg.type];
								var unit = SCG.GO.create("unit", {
									position: new V2(as.space.width-25, getRandomInt(25,as.space.height-25)),
									size:new V2(50,50),
									side: 2,
									health:100,
									speed:0.3,
									unitType: unitType,
									level: 0
								});

								while(unit.level < msg.level){
									unit.levelUp();
								}

								msg.items.forEach(function(el, i){
									if(el){
										var matIndex = as.game.level < 4 ? 0 : as.game.level <8 ? 1 : 2; 
										var availableItems = globals.items.filter(function(_el){ 
											return _el.itemType == globals.itemTypes[i] && _el.unitTypes.indexOf(unitType) != -1 && _el.itemName.indexOf(globals.materialTypes[matIndex])!= -1; 
										});
										
										if(availableItems.length > 0){
											unit.addItem(SCG.GO.create("item",
												availableItems[getRandomInt(0, availableItems.length - 1)]
											));	
										}
									}
								});

								unit.expCost = 30 + (10*unit.level);
								unit.cost = 20 + (5*unit.level);

								as.go.push(unit);
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
								self.helpers = {
									move: function(id, position){
										self.postMessage({command: 'move', message: { id: id, position: position } });				
									},
									create: function(level, type, items){
										self.postMessage({command: 'create', message: { type: type, level: level, items: items } });		
									},
									end: function(gameOver){
										self.postMessage({command: gameOver ? 'gameOver': 'waveEnd', message: { } });					
									}
								}

								break;
							case 'units':
								var env = self.environment;
								var eu = env.units;

								if(env.waveProps.end){
									return;
								}

								for(var i =1;i<3;i++){
									eu[i==1?'player':'ai'] = task.message.filter(function(el){ return el.side == i}).map(function(el){  el.position = new V2(el.position); return el;});
								}

								var sh = self.helpers;

								if(eu.player.length == 0){
									sh.end(true);
								}

								if(sh == undefined || eu.player.length == 0){return;}

								if(env.waveProps.created < env.waveProps.max){
									if(env.waveProps.atOnce > eu.ai.length){
										var lvl = getRandomInt(env.level == 1 ? 0 : env.level,env.level*2);
										var type = getRandomInt(0,2);
										var items = [];
										for(var i = 0;i<4;i++){
											items[i] = Math.random() > (1 - (env.level/10));
										}
										sh.create(lvl, type,items);
										env.waveProps.created++;
									}	
								}
								else{
									if(eu.ai.length == 0){
										env.waveProps.end = true;
										sh.end();
									}
								}
								

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
									
									if(closest.distance > aiUnit.range) {
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
					dex: 0, // not used
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

					Object.keys(that.items).forEach(function(key, index){
						if(that.items[key]){
							that.items[key] = SCG.GO.create("item",
								SCG.globals.items.filter(function(el) { return el.itemName == that.items[key] })[0] 	
								 );
						}
					});
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
				levelUp: function(attr){
					if(attr == undefined){
						attr = SCG.globals.attributes[getRandomInt(0,2)]
					}
					
					this.stats[attr]++;
					this.level++;
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
					var that= this;
					return {
						id: that.id,
						position: that.position,
						health: that.getStats('health'),
						damage: that.getStats('damage'),
						side: that.side,
						range: that.getStats('attackRadius'),
						size: that.size
					}
				},
				toSave: function(){
					var that= this;
					return {
						side: that.side,
						size: that.size,
						speed: that.speed,
						level: that.level,
						experience: that.experience,
						unitType: that.unitType,
						stats: that.stats,
						items: {
							weapon : that.items.weapon ? that.items.weapon.toSave() : undefined,
							armor: that.items.armor ? that.items.armor.toSave() : undefined,
							helmet: that.items.helmet ? that.items.helmet.toSave() : undefined,
							shield: that.items.shield ? that.items.shield.toSave() : undefined
						}
					}
				},
				canAttackToggle: function(){
					this.canAttack = !this.canAttack;
					this.attackDelayTimer.lastTimeWork = new Date;
					this.attackDelayTimer.currentDelay = this.getStats('attackRate');
				},
				receiveAttack: function(damage, sender){
					var defence = this.getStats('defence');
					damage-=defence;
					if(damage<=0){
						damage = Math.random() < (1/((defence-damage)*1.5) ? damage / 3 : 0);
						if(damage<=0){
							return;
						}
					}

					damage = parseFloat(damage.toFixed(1));
					var as = SCG.scenes.activeScene;
					as.unshift.push(
						globals.cfo( {
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
						if(this.side == 2){
							sender.experience += this.expCost; 
							as.game.money+=this.cost;
							as.game.labels.money.text.value = as.game.money;
							SCG.UI.invalidate();
						}
						this.setDead();
					}
				},
				beforeDead: function(){
					SCG.scenes.activeScene.go.push(
						globals.cfo( {
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
					var as = SCG.scenes.activeScene;
					var damageObj = this.getStats('damage');
					var damage = getRandom(damageObj.min,damageObj.max)*(Math.random() < damageObj.crit/100 ? 3 : 1);
					if(!this.getStats('ranged')){
						as.unshift.push(
							globals.cfo({
								position: this.position.clone(),
								imgPropertyName: 'actions',
								destSourcePosition : new V2(shift*50,0),
								size: new V2(50,50)
							}));	

						SCG.audio.start({notes: [{value:200,duration:0.7}],loop:false});
						SCG.audio.start({notes: [{value:1000,duration:0.3}],loop:false});

						target.receiveAttack(damage, this);
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
						as.unshift.push(
							SCG.GO.create("projectile", {
								position: path.shift(),
								path: path,
								side: this.side,
								sender: this,
								damage: damage,
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
					var that = this;
					var ctx = that.context;
					var rp = that.renderPosition;
					ctx.translate(rp.x,rp.y);

					var that = that;
					Object.keys(that.items).sort().forEach(function(key, index){
						that.items[key].render();
					});

					var renderSize = that.renderSize;

					if(that.selected){
						ctx.drawImage(SCG.images['actions'], 
							200,
							0,
							50,
							50,
							0-renderSize.x/2, 
							0-renderSize.y/2, 
							renderSize.x, 
							renderSize.y);	
					}
					
					var fontSize = renderSize.y/4;

					ctx.font = fontSize + 'px Arial';
					ctx.fillStyle = 'blue';
					ctx.fillText(that.unitType.substring(0,1)+that.level, renderSize.x/3,-renderSize.y/4);

					var maxHealth = 100+(that.stats.con*20);
					var currentHealth = that.getStats('health');
					var healthPercenage = that.getStats('health')/(100+(that.stats.con*20));
					ctx.fillStyle = 'red';
					ctx.fillRect(-renderSize.x/2,-renderSize.y/2,renderSize.x*0.8, renderSize.y/10);
					ctx.fillStyle = 'green';
					ctx.fillRect(-renderSize.x/2,-renderSize.y/2,(renderSize.x*0.8)*healthPercenage, renderSize.y/10);

					ctx.translate(-rp.x,-rp.y);
				}
			},
			{ 
				type: 'line',
				size: new V2(1,1),
				isCustomRender: true,
				customRender: function() {
					var ctx = SCG.context;
					var rs = this.renderSize;
					ctx.beginPath();
					ctx.rect(this.renderPosition.x - rs.x/2, this.renderPosition.y - rs.y/2, rs.x, rs.y);
					ctx.fillStyle ='red';
					ctx.fill()
				},
			},
			{
				type: 'projectile',
				damage: 1,
				path: [],
				speed: 5,
				destSourcePosition : new V2(60,250),
				imgPropertyName: 'items',
				size: new V2(10,25),
				setDeadOnDestinationComplete: true,
				angle: 0,
				beforeDead: function(){
					var as = SCG.scenes.activeScene;
					var that = this;
					var gos = as.go.filter(function(el){return el.type=='unit' && el.side && el.side != that.side && el.box.isPointInside(that.position)});
					for(var ui = 0;ui < gos.length;ui++){
						gos[ui].receiveAttack(this.damage, this.sender);
					}
				},
				internalPreRender: function(){
					var ctx =SCG.context; 
					var rp = this.renderPosition;
					var dir = this.direction;
					ctx.translate(rp.x,rp.y);
					if(dir && !dir.equal(new V2)){
						this.angle = V2.up().angleTo(dir,true);
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
				static: true,
				toSave: function(){
					return this.itemName;
				}
			}
		],

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
			var game = this.game;
			if(props.fromBattle){
				this.go = props.gos;
				this.game.money = props.money;
				if(props.level){
					this.game.level = props.level;
				}
			}
			else if(props.fromUTSelect && props.type){
				if(game.updateMoney(50)){
					this.go.push(SCG.GO.create("unit", {
						position: new V2,
						size:new V2(50,50),
						health: 100,
						unitType: props.type 
					}));
				}
			}
			
			// render player units
			var selectedUnit = undefined;
			this.go.forEach(function(el,i){
				el.position = new V2(el.size.x/2,(el.size.y/2)+i*50);
				el.destination = undefined;
				el.health = 100;
				if(!props.fromItemSelect && !props.fromLevelUp){
					el.selected =  false;	
				}
				el.regClick();
			});	

			if(this.go.length<6){
				for(var i = this.go.length;i<7;i++){
					(function(index){
						that.ui.push(globals.cb( {
							position: new V2(25,25+index*50),
							text: {value:'HIRE 50',autoSize:true,font:'Arial', color: 'gold'},
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
			var labels = game.selectedUnit.statsControls.labels;
			Object.keys(labels).forEach(function(el){
				that.ui.push(labels[el]);
			});

			var buttons = game.selectedUnit.statsControls.buttons;
			Object.keys(buttons).forEach(function(el){
				that.ui.push(buttons[el]);
			});

			var moneyLabel = globals.cl( { position: new V2(100,10),size: new V2(100,20), text: { size: 10, value: game.money, color: 'gold', format: 'Money: {0}'} });
			game.labels.money = moneyLabel;
			this.ui.push(moneyLabel);

			this.ui.push(globals.cl( { position: new V2(200,10),size: new V2(100,20), text: { size: 10, value: game.level, color: 'orange', format: 'Wave level: {0}'} }));


			that.ui.push(SCG.GO.create("image", { position: new V2(230, 220),size: new V2(150,150), destSourcePosition : new V2(0,0), destSourceSize: new V2(50,50), imgPropertyName: 'unit'}));

			that.ui.push(globals.cb( { position: new V2(this.space.width-130, 50), size: new V2(70,40), text: {value:'Play',autoSize:true,font:'Arial'},handlers: {
				click: function(){
					if(that.go.length == 0){
						alert('You have no units to play!\nHire someone.');
						return;
					}
					else if(that.go.filter(function(el) { return el.experience >= el.getStats('expCap');}).length > 0){
						alert('One of your units need level up!');
						return;	
					}

					var data = {
						money: game.money,
						level: game.level,
						gos: that.go.map(function(el) {return el.toSave()})
					}

					SCG.gameControls.storage.save('rpg_0', data);

					SCG.scenes.selectScene(scene1.name, {fromManagement: true, gos: that.go, level: game.level, money: game.money});
					return {
						preventBubbling: true
					};
				}
			}}));

			that.ui.push(globals.cb( { position: new V2(this.space.width-130, 90), size: new V2(70,40), text: {value:'Level up',autoSize:true,font:'Arial'},handlers: {
				click: function(){
					var unit = SCG.scenes.activeScene.game.selectedUnit.unit;
					if(!SCG.scenes.activeScene.game.selectedUnit.unit){
						alert('No selected unit');	
						return;
					}

					if(unit.experience < unit.getStats('expCap')){
						alert('Level up is unavailable');	
						return;	
					}

					SCG.scenes.selectScene(scene5.name); 
					return {
						preventBubbling: true
					};
				}
			}}));

			if(!props.fromItemSelect){
				if(props.fromLevelUp )
				{
					if(props.attr)
					{
						game.selectedUnit.unit.levelUp(props.attr);
					}

					game.unitSelected(game.selectedUnit.unit);
				}
				else{
					game.selectedUnit.unit = undefined;
				}
				
			}
			else{
				var unit = game.selectedUnit.unit;
				if(props.item){
					if(game.updateMoney(props.item.price)){
						unit.addItem(SCG.GO.create("item",
							props.item
						));	
					}					
				}
				
				game.unitSelected(game.selectedUnit.unit);
			}

			SCG.UI.invalidate();
		},
		backgroundRender: function(){
			globals.bgRender();
		},
		preMainWork: function() {
			globals.clearBg();
		},
		game: {
			money: 0,
			level: 1,
			setMoney: function(value){
				this.money=value;
				this.labels.money.text.value = this.money;
			},
			updateMoney: function(price){
				var result = this.money > price;
				if(result){
					this.setMoney(this.money-price);
				}
				else{
					alert('Not enought money!');
				}

				return result;
			},
			labels: {
				money: undefined
			},
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
								that.labels[el.n] = globals.cl( 
									{ position: el.p,size: new V2(el.s ? el.s : 100,30), text: { size: 15, color:el.color ? el.color : 'Black', value: 0, format:el.f } });
							});

						
						 [{n: 'wpn', p: new V2(170, 220), s: new V2(40,120), it: 'weapon'},
							{n: 'shd', p: new V2(295, 220), s: new V2(50,120), it: 'shield'},
							{n: 'hlm', p: new V2(230, 185), s: new V2(80,50), it: 'helmet'},
							{n: 'arm', p: new V2(230, 235), s: new V2(80,50), it: 'armor'}].forEach(function(el){
							that.buttons[el.n] = globals.cb( { position: el.p,size: el.s, border:true, useInnerCanvas: false, 
								handlers: { 
									click: function(){ 
										var unit = SCG.scenes.activeScene.game.selectedUnit.unit;
										if(!unit){
											alert('No selected unit');	
										}
										else{
											var equippedItem = unit.items[el.it];
											//equippedItem
											SCG.scenes.selectScene(scene4.name, {unitType: unit.unitType, itemType: el.it, equippedItem: equippedItem ? equippedItem.itemName : ''});
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
				labels.hp.text.value = unit.getStats('health');
				labels.str.text.value = unit.stats.str;
				labels.agl.text.value = unit.stats.agl;
				labels.con.text.value = unit.stats.con;

				labels.lvl.text.value = unit.level;
				labels.exp.text.value = String.format("{0}-{1}",unit.experience, unit.getStats('expCap'));
				labels.exp.text.color = unit.experience >= unit.getStats('expCap') ? 'green' : 'black';
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

			var types = SCG.globals.unitTypes;
			var itemSize = new V2((space.width*0.8)/types.length,space.height*0.7);

			types.forEach(function(el,i){
				that.ui.push(globals.cb( {
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
			globals.clearBg();
		},
		backgroundRender: function(){
			globals.bgRender();
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

			globals.items.filter(function(el){ return el.itemType == props.itemType && el.unitTypes.indexOf(props.unitType) != -1 && el.itemName != props.equippedItem}).forEach(function(el,i){
				var row = parseInt(i/3);
				var column = i-row*3;
				var btnPosition = new V2(shifts.x+ itemSize.x/2 + itemSize.x*column, shifts.y+ itemSize.y/2 + itemSize.y*row );

				that.ui.push(globals.cb( {
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
				that.ui.push(globals.cl( { position: lablesTop.add(new V2(0, labelSize.y/2)),size: labelSize, text: { color:'Red', value: el.price, format: 'Price: {0}' } }));
				switch(el.itemType){
					case 'weapon':
						that.ui.push(globals.cl( { position: lablesTop.add(new V2(0, 1.5*labelSize.y)),size: labelSize, text: { size: 10, value: String.format("Damage {0}-{1}({2}%)", el.damage.min, el.damage.max,el.damage.crit)} }));
						that.ui.push(globals.cl( { position: lablesTop.add(new V2(0, 2.5*labelSize.y)),size: labelSize, text: { size: 10, value: el.attackRate, format: 'Rate: {0}'} }));
						that.ui.push(globals.cl( { position: lablesTop.add(new V2(0, 3.5*labelSize.y)),size: labelSize, text: { size: 10, value: el.attackRadius, format: 'Range: {0}'} }));
						break
					case 'shield':
					case 'armor':
					case 'helmet':
						that.ui.push(globals.cl( { position: lablesTop.add(new V2(0, 1.5*labelSize.y)),size: labelSize, text: { size: 10, value: el.defence, format: 'Defence: {0}'} } ));
						break
				}
				
			});

			
			var viewfield = SCG.viewfield;
			SCG.context.clearRect(0, 0, viewfield.width, viewfield.height);
			SCG.UI.invalidate();
			
		},
		preMainWork: function() {
			globals.clearBg();
		},
		backgroundRender: function(){
			globals.bgRender();
		},
	}

	var scene5 = {
		name: "level_up",
		space: {
			width: SCG.viewfield.default.width,
			height: SCG.viewfield.default.height
		},
		start: function(props){
			var that = this;
			var space = this.space;
			var shifts = new V2(space.width*0.1, space.height*0.15);
			var globals = SCG.globals;
			globals.modalClose(that, space, function(){ SCG.scenes.selectScene(scene2.name, {fromLevelUp: true, attr: undefined}); });
			var itemSize = new V2((space.width*0.8)/3,space.height*0.7);

			var itemFullName = '';
			var itemDescription = '';
			globals.attributes.forEach(function(el,i){
				var position = new V2(shifts.x +  itemSize.x/2 + itemSize.x*i,shifts.y + itemSize.y/2);
				itemFullName = i == 0? 'Strenght' : i == 1? 'Agility' : 'Constitution';
				itemDescription = i == 0? 'Increase damage by 20%' : i == 1? 'Increase defence by 20%' : 'Increase health by 20';
				that.ui.push(globals.cl( { position: position.substract(new V2(0,20)),size: itemSize, text: { size: 20, value: itemFullName} }));
				that.ui.push(globals.cl( { position: position.substract(new V2(0,-20)),size: itemSize, text: { size: 10, value: itemDescription} }));
				that.ui.push(globals.cb( {
					position: position,
					size: itemSize,
					text: {value: '', autoSize:true,font:'Arial'},
					handlers: {
						click: function(){
							SCG.scenes.selectScene(scene2.name, {fromLevelUp: true, attr: el});
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
			globals.clearBg();
		},
		backgroundRender: function(){
			globals.bgRender();
		},
	}

	var newGameScene = {
		name: "new_game",
		space: {
			width: SCG.viewfield.default.width,
			height: SCG.viewfield.default.height
		},
		dispose: function(){
			for(var i=0;i<this.game.intervals.length;i++){
				clearInterval(this.game.intervals[i]);
			}
		},
		start: function(props){
			var that = this;
			[
				{name: 'New game', py : 100, click: function(){ SCG.scenes.selectScene(introScene.name); } },
				{name: 'Continue', py : 150, click: function(){ var data = SCG.gameControls.storage.load('rpg_0');

					if(data){
						var gos = data.gos.map(function(el){ el.size = new V2(el.size); return SCG.GO.create("unit", el);  });
						SCG.scenes.activeScene.go = [];
						SCG.scenes.selectScene(scene2.name, {fromBattle: true, level: data.level, gos: gos, money: data.money});
					} } }
			].forEach(function(el) {
				that.ui.push(globals.cb( { position: new V2(250, el.py), size: new V2(180,40), text: {value:el.name,autoSize:true, color: 'white',font:'Arial'},handlers: {
					click: function(){
						
						el.click();

						return {
							preventBubbling: true
						};
					}
				}}));	
			});

			this.game.showTitle(this);
			this.game.intervals.push(setInterval(function(){
				that.game.showTitle(that);
			},2000));
			this.ui.push(globals.cl( { position: new V2(250,250),size: new V2(200,30), text: { size: 10, value: 'SCG production 2016',  color: 'white'} }));
		},
		game: {
			intervals: [],
			showTitle: function(that){
				that.unshift.push(
				globals.cfo( {
					position: new V2(120,50),
					lifeTime: 2000,
					text: {
						size:40,
						color: 'gold',
						value: "Inevitable glitch",
					},
					size: new V2(200,60),
					shift: new V2(0,0.05)
				}));
			}
		},
		preMainWork: function() {
			globals.clearBg();
		},
		backgroundRender: function(){
			globals.bgRender({color: 'black'});
		},
	}

	var gameOverScene = {
		name: "game_over",
		space: {
			width: SCG.viewfield.default.width,
			height: SCG.viewfield.default.height
		},
		start: function(props){
			var that = this;
			['A problem has been detected and system has been shut down to prevent damage',
			'to your device',
			'',
			'The problem seems to be caused by the following file: VIRUS.SYS',
			'',
			'If this is the first time you\'ve seen this stop error screen,',
			'it means you loose and game is over. If this screen appears again, follow',
			'these steps:',
			'',
			'Try reload page and press continue to restore your progress, or press new game',
			'to begin new game. Ask your hardware or software manufacturer for any system',
			'updates you might need',
			'',
			'If problem continue, disable or remove any newly installed hardware',
			'or software. Disable BIOS memory options such as caching or shadowing.',
			'If you need to use safe mode ro remove or disable components, restart',
			'your device, then do something to enter to safe mode.',
			'',
			'Technical information:',
			'',
			'*** STOP: 0x00000087 (0x20160913, 0x44312346, 0x05673245, 0x00000000)',
			'',
			'*** VIRUS.SYS - Have a nice day. Address: 0x2346123 base 0x633456'].forEach(function(el, i) {
				that.ui.push(globals.cl( { position: new V2(10,(i+1)*12),size: new V2(1000,12), text: { size: 12, value: el,  color: 'white', align: 'left'} }));	
			});
			
			SCG.UI.invalidate();
		},
		preMainWork: function() {
			globals.clearBg();
		},
		backgroundRender: function(){
			globals.bgRender({color: '#000082'});
		},
	}

	var introScene = {
		name: "intro",
		space: {
			width: SCG.viewfield.default.width,
			height: SCG.viewfield.default.height
		},
		dispose: function(){
			for(var i=0;i<this.game.timeouts.length;i++){
				clearTimeout(this.game.timeouts[i]);
			}
		},
		start: function(){
			var that = this;
			[ 'Usage of unlicensed software'
			, 'not only violates the law'
			, 'but it may harm your system'
			, 'with the result that GLITCHES can come'
			, 'or system will stop working completely'
			, ''
			, 'Take on the role of the anti-malvare team'
			, 'and save the system from infection'
			, 'during the 10 attack waves'
			, 'in style of simple RPG'
			, ''
			, 'Have a nice play'
			, '$$$'].forEach(function(el,i, arr){
				that.game.show(that, el, (i+1)*2000);
			});
		},
		game: {
			timeouts: [],
			show: function(that, text, delay){
				var _this = this;
				this.timeouts.push(setTimeout(function(){
					if(text == '$$$'){
						_this.clickHandler();
					}
					else{
						that.unshift.push(
							globals.cfo( {
								position: new V2(120,150),
								lifeTime: 5000,
								text: {
									size:20,
									color: 'white',
									value: text,
								},
								size: new V2(200,60),
								shift: new V2(0,-0.25)
							}));	
					}
				}, delay));
			},
			clickHandler: function(clickPosition){
				SCG.scenes.selectScene(scene2.name, {money: 200, level: 1, fromBattle: true, gos: []}); 
			}
		},
		preMainWork: function() {
			globals.clearBg();
		},
		backgroundRender: function(){
			globals.bgRender({color: 'Black'});
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
		var materialNames = SCG.globals.materialTypes;

		for(var i = 0;i<3;i++){
			drawFigures(itemsCanvasContext, //sword
				[[new V2(2.5+delta,30),new V2(2.5+delta,15),new V2(5+delta,12.5),new V2(7.5+delta,15),new V2(7.5+delta,30)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]})
			itemsCanvasContext.fillStyle = "#ffd700";
			itemsCanvasContext.fillRect(1.5+delta,30,7,2);
			itemsCanvasContext.fillStyle = "#5b3a29";
			itemsCanvasContext.fillRect(3.5+delta,32,3,3);
			SCG.globals.items.push({ itemName: materialNames[i] + ' sword', price: i==0?50:i==1?250:500, position: new V2(-20, -7), attackRadius: 10, damage: {min:1+(i*5),max:5*(Math.pow(2,i+1)),crit:(i+1)}, attackRate: 1000, destSourcePosition : new V2(delta,0), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Fighter'] });
			
			deltay = 50;
			drawFigures(itemsCanvasContext, //axe
				[[new V2(7.5+delta,20+deltay),new V2(5+delta,22.5+deltay),{type:'curve', control: new V2(1.5+delta,17.5+deltay), p: new V2(5+delta,12.5+deltay)},new V2(7.5+delta,15+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = "#5b3a29";
			itemsCanvasContext.fillRect(7+delta,15+deltay,1.5,20);
			SCG.globals.items.push({ itemName: materialNames[i] + ' axe', price: i==0?100: i*350, position: new V2(-20, -7), attackRadius: 5, damage: {min:5*(i+1),max:15*(i+1),crit:4+(i*2)}, attackRate: 3000, destSourcePosition : new V2(delta,deltay), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Fighter'] });

			deltay = 100;
			drawFigures(itemsCanvasContext, //spear
				[[new V2(5+delta,0+deltay), new V2(7+delta,5+deltay),new V2(5+delta,10+deltay),new V2(3+delta,5+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = "#5b3a29";
			itemsCanvasContext.fillRect(4+delta,10+deltay,1.5,35);
			SCG.globals.items.push({ itemName: materialNames[i] + ' spear',price: i==0?75:i*300, position: new V2(-20, -0), attackRadius: 25, damage: {min:(i*5),max:15*(i+1),crit:13+i}, attackRate: 2000, destSourcePosition : new V2(delta,deltay), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Defender'] });

			deltay = 150;
			drawFigures(itemsCanvasContext, //halbert
				[[new V2(5+delta,0+deltay), new V2(7+delta,5+deltay),new V2(5+delta,10+deltay),new V2(3+delta,5+deltay)],
				[new V2(9+delta, 12.5+deltay),new V2(2.5+delta, 10+deltay),{type:'curve', control: new V2(0+delta,15+deltay), p: new V2(3.5+delta,20+deltay)}]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = "#5b3a29";
			itemsCanvasContext.fillRect(4+delta,17+deltay,1.5,30);
			SCG.globals.items.push({ itemName: materialNames[i] + ' halbert', price: i==0? 120 : i*400, position: new V2(-20, -0), attackRadius: 25, damage: {min:5*(i+1),max:25+(i*25),crit:5+i}, attackRate: 4000, destSourcePosition : new V2(delta,deltay), size: new V2(10,50), itemType: 'weapon', unitTypes: ['Defender'] });
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
			SCG.globals.items.push({ itemName: materialNames[i] + 'shortBow', price: i==0?60:i==1?350:550, position: new V2(-20, 0), attackRadius: 100, damage: {min:i*5,max:5*(i+2),crit:25+i*5}, attackRate: 1250, destSourcePosition : new V2(delta,deltay), size:new V2(20,50), ranged: true, itemType: 'weapon', unitTypes: ['Ranged']  });
			
			deltay = 250;
			itemsCanvasContext.lineWidth=2;
			drawFigures(itemsCanvasContext, //bow
				[[new V2(15+delta,45+deltay),{type:'curve', control: new V2(0+delta,25+deltay), p: new V2(15+delta,5+deltay)}]],
				{alpha: 1, stroke:strokeColors[i]})
			itemsCanvasContext.lineWidth=1;
			drawFigures(itemsCanvasContext, //bow
				[[new V2(15+delta,45+deltay),new V2(15+delta,5+deltay)]],
				{alpha: 1, stroke:'#black'})
			SCG.globals.items.push({ itemName: materialNames[i] +' bow', price: i==0?150:i==1?500:900, position: new V2(-17.5, 0), attackRadius: 200, damage: {min:i==0?5:15*i,max:i==0?25:i==1?40:70,crit:3+i*3}, attackRate: 2500, destSourcePosition : new V2(delta,deltay), size:new V2(20,50), ranged: true, itemType: 'weapon', unitTypes: ['Ranged']  });

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
			SCG.globals.items.push({ itemName: materialNames[i] +' small_shield', price: i==0?30:125*i, position: new V2(17, 0), defence: 2+i*3, destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'shield', unitTypes: ['Fighter']  });

			deltay = 350;
			drawFigures(itemsCanvasContext, //middle shield
				[[new V2(15+delta,15+deltay),new V2(22.5+delta,20+deltay), {type:'curve', control: new V2(23+delta,32+deltay), p: new V2(15+delta,35+deltay)},{type:'curve', control: new V2(7+delta,32+deltay), p: new V2(7.5+delta,20+deltay)}]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			drawFigures(itemsCanvasContext, //middle shield
				[[new V2(11+delta,21+deltay),new V2(19+delta,21+deltay),new V2(15+delta,30+deltay) ]],
				{alpha: 1, fill: strokeColors[i]});
			SCG.globals.items.push({ itemName: materialNames[i] +' medium_shield', price: i==0?50:175*i, position: new V2(17, 0), defence: 5+i*5, destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'shield', unitTypes: ['Fighter', 'Defender']  });

			deltay = 400;
			drawFigures(itemsCanvasContext, //large_shield
				[[new V2(5+delta,5+deltay),new V2(25+delta,5+deltay),new V2(25+delta,45+deltay),new V2(5+delta,45+deltay),new V2(5+delta,5+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.fillRect(10+delta,10+deltay,10,30);
			SCG.globals.items.push({ itemName: materialNames[i] +' large_shield', price: i==0?75:250*i, position: new V2(17, 0), defence: 10+i*5, destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'shield', unitTypes: ['Defender']  });

			deltay = 450;
			drawFigures(itemsCanvasContext, //small helmet
				[[new V2(2+delta,25+deltay),{type:'curve', control: new V2(15+delta,10+deltay), p: new V2(28+delta,25+deltay)},new V2(2+delta,25+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			SCG.globals.items.push({ itemName: materialNames[i] +' small_helmet', price: i==0?20:100*i, position: new V2(0, -13), defence: 1+i*3, destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'helmet', unitTypes: ['Ranged', 'Fighter']  });

			deltay = 500;
			drawFigures(itemsCanvasContext, //medium_helmet
				[[new V2(2+delta,25+deltay),{type:'curve', control: new V2(15+delta,10+deltay), p: new V2(28+delta,25+deltay)},new V2(2+delta,25+deltay)],
				[new V2(2+delta,25+deltay), new V2(2+delta,35+deltay),new V2(10+delta,25+deltay)],
				[new V2(28+delta,25+deltay), new V2(28+delta,35+deltay),new V2(20+delta,25+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			SCG.globals.items.push({ itemName: materialNames[i] +' medium_helmet', price: i==0?40:150*i, position: new V2(0, -13), defence: 3+i*3, destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'helmet', unitTypes: ['Fighter', 'Defender']  });

			deltay = 550;
			drawFigures(itemsCanvasContext, //full_helmet
				[[new V2(2+delta,25+deltay),{type:'curve', control: new V2(15+delta,10+deltay), p: new V2(28+delta,25+deltay)},new V2(2+delta,25+deltay)],
				[new V2(2+delta,25+deltay), new V2(2+delta,35+deltay),new V2(7+delta,35+deltay),{type:'curve', control: new V2(15+delta,30+deltay), p: new V2(23+delta,35+deltay)},new V2(28+delta,35+deltay),new V2(28+delta,25+deltay)]],
				{alpha: 1, fill: fillColors[i], stroke:strokeColors[i]});
			SCG.globals.items.push({ itemName: materialNames[i] +' full_helmet', price: i==0?50:175*i, position: new V2(0, -13), defence: 5+i*5, destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'helmet', unitTypes: ['Defender']  });

			deltay = 600;
			drawFigures(itemsCanvasContext, //armor
				[[new V2(2+delta,20+deltay),new V2(28+delta,30+deltay)],
				[new V2(2+delta,30+deltay),new V2(28+delta,20+deltay)]],
				{alpha: 1, stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.fillRect(10+delta,22+deltay,10,6);
			SCG.globals.items.push({ itemName: materialNames[i] +' light_armor', price: i==0?50:200*i, position: new V2(0, 8), defence: 5*(i+1), destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'armor', unitTypes: ['Ranged', 'Fighter']  });


			deltay = 650;
			drawFigures(itemsCanvasContext, //armor
				[[new V2(2+delta,20+deltay),{type:'curve', control: new V2(15+delta,23+deltay), p: new V2(28+delta,20+deltay)},new V2(28+delta,28+deltay),{type:'curve', control: new V2(15+delta,25+deltay), p: new V2(2+delta,28+deltay)},new V2(2+delta,20+deltay)]],
				{alpha: 1, fill: fillColors[i],stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.fillRect(4+delta,23+deltay,22,2);
			SCG.globals.items.push({ itemName: materialNames[i] +' medium_armor', price: i==0?75:i==1?300:500, position: new V2(0, 8), defence: i==0?7:i==1?13:18, destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'armor', unitTypes:['Fighter', 'Defender']   });

			deltay = 700;
			drawFigures(itemsCanvasContext, //armor
				[[new V2(2+delta,16+deltay),{type:'curve', control: new V2(15+delta,21+deltay), p: new V2(28+delta,16+deltay)},new V2(28+delta,30+deltay),{type:'curve', control: new V2(15+delta,32+deltay), p: new V2(2+delta,30+deltay)},new V2(2+delta,16+deltay)]],
				{alpha: 1, fill: fillColors[i],stroke:strokeColors[i]});
			itemsCanvasContext.fillStyle = strokeColors[i];
			itemsCanvasContext.fillRect(4+delta,23+deltay,22,2);
			SCG.globals.items.push({ itemName: materialNames[i] +' full_armor', price: 100+i*300, position: new V2(0, 8), defence: 10+i*6, destSourcePosition : new V2(delta,deltay), size:new V2(30,50),  itemType: 'armor', unitTypes:['Defender']   });


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

	SCG.scenes.registerScene(newGameScene);
	SCG.scenes.registerScene(gameOverScene);
	SCG.scenes.registerScene(introScene);
	SCG.scenes.registerScene(scene1);
	SCG.scenes.registerScene(scene2);
	SCG.scenes.registerScene(scene3);
	SCG.scenes.registerScene(scene4);
	SCG.scenes.registerScene(scene5);

	SCG.scenes.selectScene(newGameScene.name);
	//SCG.scenes.selectScene(scene2.name, {money: 1000, fromBattle: true, gos: []});

	SCG.start();
})