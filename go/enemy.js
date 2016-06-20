SCG.GO.EnemyPaths = {
	getRandomPath: function(){
		return this.getPath(getRandomInt(0, SCG.GO.EnemyPaths.paths.length-1));
	},
	getPath: function(index) {
		var path = this.paths[index];
		var newPath = [];
		for(var i = 0; i<path.length;i++){
			newPath.push(path[i].clone());
		}
		return newPath;
	},
	render: function(){
		for(var p = 0; p < this.paths.length; p++)
		{
			SCG.context.beginPath();
			for(var pi = 0; pi < this.paths[p].length-1; pi++){
				SCG.context.moveTo(this.paths[p][pi].x, this.paths[p][pi].y);
				SCG.context.lineTo(this.paths[p][pi+1].x, this.paths[p][pi+1].y);
			}
			SCG.context.lineWidth = 2;
			SCG.context.strokeStyle = 'blue';
			SCG.context.stroke();
		}
	},
	paths: [
		[new Vector2(500,20), new Vector2(400,50), new Vector2(350,100), new Vector2(300,150), new Vector2(250,190), new Vector2(120,240), new Vector2(80,190), new Vector2(-20,150)],
		[new Vector2(500,270), new Vector2(380,240), new Vector2(340,200), new Vector2(300,150), new Vector2(240,100), new Vector2(125,60), new Vector2(80,100), new Vector2(-20,150)],
		[new Vector2(500,150), new Vector2(420,140), new Vector2(300,40), new Vector2(220,90), new Vector2(160,150), new Vector2(80,190), new Vector2(-20,150)],
		[new Vector2(500,150), new Vector2(420,140), new Vector2(300,250), new Vector2(190,200), new Vector2(160,150), new Vector2(80,100), new Vector2(-20,150)]
	],
	show: false
}

SCG.EnemySpawner = {
	enemySoldiers: {
		currentSpawnDelay : 0,
		originSpawnDelay : 1100,
		currentCount: 0,
		maxCount : 15,
		countStep: 15,
		spawner: function(path){
			SCG.go.push(new SCG.GO.EnemySoldier({position: path.shift().clone(), path: path}));
		},
		levelUp: function(level){
			this.maxCount = (level+1) * this.countStep;
			this.originSpawnDelay *= 0.9;
		}
	},
	enemyVehicle: {
		currentSpawnDelay: 0,
		originSpawnDelay: 10000,
		currentCount: 0,
		maxCount : 0,
		countStep: 1,
		spawner: function(path){
			SCG.go.push(new SCG.GO.EnemyVehicle({position: path.shift().clone(), path: path}));
		},
		levelUp: function(level){
			if((level+1) % 5 == 0){
				this.maxCount++;
				this.originSpawnDelay *= 0.9;	
			}
		}
	},
	enemyLarge: {
		currentSpawnDelay : 0,
		originSpawnDelay : 6000,
		currentCount: 0,
		maxCount : 0,
		countStep: 1,
		spawner: function(path){
			SCG.go.push(new SCG.GO.EnemyLarge({position: path.shift().clone(), path: path}));
		},
		levelUp: function(level){
			if((level+1) % 3 == 0){
				this.maxCount++;
				this.originSpawnDelay *= 0.9;	
			}
		}
	},
	lastTimeWork : new Date,
	delta: 0,
	levelUp: function(level){
		this.enemySoldiers.levelUp(level);
		this.enemyLarge.levelUp(level);
		this.enemyVehicle.levelUp(level);
	},
	doWork: function(now){
		if(SCG.gameLogics.isPaused){
			this.lastTimeWork = now;
			this.delta = 0;
			return;
		}

		this.delta = now - this.lastTimeWork;
		this.doWorkInternal(this.enemySoldiers, this.delta);
		this.doWorkInternal(this.enemyLarge, this.delta);
		this.doWorkInternal(this.enemyVehicle, this.delta);
		this.lastTimeWork = now;
	},
	doWorkInternal: function(entry, delta){
		if(entry.currentCount < entry.maxCount){
			entry.currentSpawnDelay-=delta;
			if(entry.currentSpawnDelay < 0){
				entry.currentSpawnDelay = entry.originSpawnDelay;
				entry.currentCount++;
				entry.spawner(SCG.GO.EnemyPaths.getRandomPath());
			}
		}
	}
}

SCG.GO.EnemySoldier = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG.GO.EnemySoldier -> position is undefined';
	}

	if(prop.size == undefined){ prop.size = new Vector2(10,10); }
	if(prop.maxHealth == undefined){ prop.maxHealth = 2 + (SCG.difficulty.level*0.5); }
	SCG.GO.GO.call(this,prop);

	//overriding defaults and props
	this.img = SCG.images.enemy_soldier;
	this.speed = 0.30 + (SCG.difficulty.level*0.03);
	this.randomizeDestination = true;
	this.randomizeDestinationRadius = 15;
	this.updatePlaceable = true;
	this.hasPlaceable = true;
	this.id = 'EnemySoldier' + (SCG.GO.EnemySoldier.counter++);
	this.side = 2;
	this.isDrawingHealthBar = true;
	this.experienceCost = 7 + (SCG.difficulty.level*2.5);
	this.moneyCost = 2 + (SCG.difficulty.level*0.1);

	// SCG.Placeable.set(this);
	 SCG.Placeable.enemyUnits[this.id] = this;
}

SCG.GO.EnemySoldier.counter = 0;
SCG.GO.EnemySoldier.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.EnemySoldier.prototype.constructor = SCG.GO.EnemySoldier;

SCG.GO.EnemySoldier.prototype.beforeDead = function(){
	SCG.GO.Remains.types.getObject('soldier', this.position.clone());
}

SCG.GO.EnemyLarge = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG.GO.EnemyLarge -> position is undefined';
	}

	if(prop.size == undefined){ prop.size = new Vector2(20,20); }
	if(prop.maxHealth == undefined){ prop.maxHealth = 100 + (SCG.difficulty.level*10); }
	SCG.GO.GO.call(this,prop);

	//overriding defaults and props
	this.img = SCG.images.enemy_large;
	this.speed = 0.1 + (SCG.difficulty.level*0.01);
	this.randomizeDestination = true;
	this.randomizeDestinationRadius = 15;
	this.updatePlaceable = true;
	this.hasPlaceable = true;
	this.id = 'EnemyLarge' + (SCG.GO.EnemyLarge.counter++);
	this.side = 2;
	this.isDrawingHealthBar = true;
	this.experienceCost = 30 + (SCG.difficulty.level*4);
	this.moneyCost = 20 + (SCG.difficulty.level*5);

	// SCG.Placeable.set(this);
	 SCG.Placeable.enemyUnits[this.id] = this;
}

SCG.GO.EnemyLarge.counter = 0;
SCG.GO.EnemyLarge.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.EnemyLarge.prototype.constructor = SCG.GO.EnemyLarge;

SCG.GO.EnemyLarge.prototype.beforeDead = function(){
	SCG.GO.Remains.types.getObject('soldierLarge', this.position.clone());
}


SCG.GO.EnemyVehicle = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG.GO.EnemyVehicle -> position is undefined';
	}

	if(prop.size == undefined){ prop.size = new Vector2(25,16.25); }
	if(prop.maxHealth == undefined){ prop.maxHealth = 200 + (SCG.difficulty.level*5); }
	SCG.GO.GO.call(this,prop);

	//overriding defaults and props
	this.img = SCG.images.enemy_vehicle;
	this.speed = 0.1 + (SCG.difficulty.level*0.0075);
	this.randomizeDestination = true;
	this.randomizeDestinationRadius = 5;
	this.updatePlaceable = true;
	this.hasPlaceable = true;
	this.id = 'EnemyVehicle' + (SCG.GO.EnemyVehicle.counter++);
	this.side = 2;
	this.isDrawingHealthBar = true;
	this.experienceCost = 60 + (SCG.difficulty.level*6);
	this.moneyCost = 40 + (SCG.difficulty.level*10);

	// SCG.Placeable.set(this);
	SCG.Placeable.enemyUnits[this.id] = this;
	this.armoured = true;
}

SCG.GO.EnemyVehicle.counter = 0;
SCG.GO.EnemyVehicle.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.EnemyVehicle.prototype.constructor = SCG.GO.EnemyVehicle;

SCG.GO.EnemyVehicle.prototype.beforeDead = function(){
	SCG.Animations.createObject('mediumExplosion', this.position.add(new Vector2(-5,5), true));
	SCG.Animations.createObject('mediumExplosion', this.position.add(new Vector2(5,5), true));
	SCG.Animations.createObject('mediumExplosion', this.position.add(new Vector2(0,-5), true));
}
