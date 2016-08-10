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
					position: new Vector2(-20, 0),
					imgPropertyName: 'weapons',
					renderSourcePosition : new Vector2(10,0)
				});


				var unit = SCG.GO.create("unit", {
					position: new Vector2(250, 150),
					size:new Vector2(50,50),
				});
				unit.addItem(sword);
				this.go.push(unit);

				this.go.push(SCG.GO.create("unit", {
					position: new Vector2(150, 50),
					size:new Vector2(50,50),
					side: 2,
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
				items: [],
				side: 1,
				health: 100,
				canAttack: true,
				originDefence: 1,
				currentDefence: 1,
				originDamage: 2,
				currentDamage: 2,
				originAttackRadius: 20,
				currentAttackRadius: 20,
				originAttackRate: 500,
				currentAttackRate: 500,
				initializer: function(that){
					that.originAttackRadius = this.size.x;
					that.currentAttackRadius = this.size.x;

					that.attackDelayTimer = {
						lastTimeWork: new Date,
						delta : 0,
						currentDelay: 0,
						originDelay: 0,
						doWorkInternal : that.canAttackToggle,
						context: that
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
							as.game.playerUnit = this;
							SCG.gameControls.camera.center(as.game.playerUnit);
						}
						
						return {
							preventBubbling: true
						};
					}
				},
				canAttackToggle: function(){
					this.canAttack = !this.canAttack;
					this.attackDelayTimer.lastTimeWork = new Date;
					this.attackDelayTimer.currentDelay = this.currentAttackRate;
				},
				receiveAttack: function(damage){
					damage-=this.currentDefence;
					if(damage<=0){
						//show fading success damage
						return;
					}

					this.health-=damage;
					//show fading damage text (red)

					if(this.health <= 0){
						this.setDead();
					}
				},
				addItem: function(item){
					this.items.push(item);
					if(item.attackRadius){
						this.currentAttackRadius = this.originAttackRadius+item.attackRadius;
					}
					if(item.damage){
						this.currentDamage = this.originDamage+item.damage;
					}
					if(item.attackRate){
						this.currentAttackRate = item.attackRate;
						this.attackDelayTimer.currentDelay = this.currentAttackRate;
						this.attackDelayTimer.originDelay = this.currentAttackRate;
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

					SCG.scenes.activeScene.go.push(
						SCG.GO.create("fadingObject", {
							position: this.position.clone(),
							imgPropertyName: 'actions',
							renderSourcePosition : new Vector2(shift*50,0),
							size: new Vector2(50,50)
						}));

					this.canAttackToggle();
					// temp
					//target.receiveAttack(this.currentDamage);
				},
				internalUpdate: function(now){
					for(var i=0;i<this.items.length;i++){
						this.items[i].update();
					}

					if(this.canAttack){
						var as = SCG.scenes.activeScene;
						var i = as.go.length;
						while (i--) {
							var go = as.go[i];
							if(go.type =='unit' && go.side != this.side && this.position.distance(go.position) < this.currentAttackRadius){
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

					for(var i=0;i<this.items.length;i++){
						this.items[i].render();
					}

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
				type: 'fadingObject',
				lifeTime: 500,
				alpha: 1,
				internalPreRender: function(){
					SCG.context.save();
					SCG.context.globalAlpha = this.alpha;
				},
				internalRender: function(){
					SCG.context.restore();
				},
				internalUpdate: function(now){
					this.alpha = 1 - (now - this.creationTime)/this.lifeTime;

					if(this.alpha <= 0){
						this.alive = false;
					}
				}
			},
			{
				type: 'weapon',
				size: new Vector2(10,50),
				attackRadius: 10,
				damage: 1,
				attackRate: 1000,
				static: true
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
		weaponsCanvas.width = 20;
		weaponsCanvas.height = 50;
		var weaponsCanvasContext = weaponsCanvas.getContext('2d');

		drawFigures(weaponsCanvasContext, //dagger
			[[new Vector2(2.5,20),new Vector2(2.5,15),new Vector2(5,12.5),new Vector2(7.5,15),new Vector2(7.5,20)]],
			{alpha: 1, fill: '#cd7f32', stroke:'#b87333'})
		weaponsCanvasContext.fillStyle = "#ffd700";
		weaponsCanvasContext.fillRect(1.5,20,7,2);
		weaponsCanvasContext.fillStyle = "#5b3a29";
		weaponsCanvasContext.fillRect(3.5,22,3,3);
		var delta = 10;
		drawFigures(weaponsCanvasContext, //long sword
			[[new Vector2(2.5+delta,20),new Vector2(2.5+delta,5),new Vector2(5+delta,2.5),new Vector2(7.5+delta,5),new Vector2(7.5+delta,20)]],
			{alpha: 1, fill: '#cd7f32', stroke:'#b87333'})
		weaponsCanvasContext.fillStyle = "#ffd700";
		weaponsCanvasContext.fillRect(1.5+delta,20,7,2);
		weaponsCanvasContext.fillStyle = "#5b3a29";
		weaponsCanvasContext.fillRect(3.5+delta,22,3,3);

		SCG.images['weapons'] = weaponsCanvas;

		var actionsCanvas = document.createElement('canvas');
		actionsCanvas.width = 250;
		actionsCanvas.height = 50;
		var actionsCanvasContext = actionsCanvas.getContext('2d');
		actionsCanvasContext.lineWidth=5;
		drawFigures(actionsCanvasContext, // right upper swing
			[[new Vector2(5,3),{type:'curve', control: new Vector2(50,0), p: new Vector2(45,47.5)}]],
			{alpha: 1, stroke:'#87cefa'})
		delta=50;
		drawFigures(actionsCanvasContext, // right bottom swing
			[[new Vector2(45+delta,5),{type:'curve', control: new Vector2(50+delta,50), p: new Vector2(5+delta,47)}]],
			{alpha: 1, stroke:'#87cefa'})
		delta=100;
		drawFigures(actionsCanvasContext, // left upper swing
			[[new Vector2(5+delta,47),{type:'curve', control: new Vector2(0+delta,0), p: new Vector2(45+delta,3)}]],
			{alpha: 1, stroke:'#87cefa'})
		delta=150;
		drawFigures(actionsCanvasContext, // left bottom swing
			[[new Vector2(45+delta,47),{type:'curve', control: new Vector2(0+delta,50), p: new Vector2(5+delta,3)}]],
			{alpha: 1, stroke:'#87cefa'})

		delta = 200;
		actionsCanvasContext.lineWidth=1;
		drawFigures(actionsCanvasContext, // select box
			[[new Vector2(1+delta,0),new Vector2(10+delta,0),new Vector2(1+delta,10)],
			[new Vector2(40+delta,0),new Vector2(50+delta,0),new Vector2(50+delta,10)],
			[new Vector2(50+delta,40),new Vector2(50+delta,50),new Vector2(40+delta,50)],
			[new Vector2(10+delta,50),new Vector2(1+delta,50),new Vector2(1+delta,40)]],
			{alpha: 1, fill:'#ffd700',stroke:'#998200'})
		

		SCG.images['actions'] = actionsCanvas;
	})

	SCG.gameControls.camera.resetAfterUpdate = true;

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})