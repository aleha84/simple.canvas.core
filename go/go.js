SCG.GO = {};

SCG.GO.GO = function(prop){
	this.defaultInitProperties = {};
	this.position = new Vector2;
	this.renderPosition = new Vector2;
	this.alive = true;
	this.id = '';
	this.size = new Vector2;
	this.renderSize = new Vector2;
	this.initialDirection = new Vector2;
	this.direction = new Vector2;
	this.speed = 0;
	this.angle = 0;
	//this.radius = 10;
	this.renderRadius = 10;
	this.img = undefined;
	this.selected = false;
	this.playerControllable =false;
	this.destination = undefined;
	this.path = [];
	this.mouseOver = false;
	this.randomizeDestination = false;
	this.randomizeDestinationRadius = new Vector2;
	this.updatePlaceable = false;
	this.hasPlaceable = false;
	this.setDeadOnDestinationComplete = false;
	this.health = 1;
	this.maxHealth = 1;
	this.isDrawingHealthBar = false;

	if(prop.size == undefined || prop.size.equal(new Vector2))
	{
		throw 'SCG2.GO.GO -> size is undefined';
	}

	if(prop!=undefined)
	{
		$.extend(this,prop);
	}
	if(this.direction!=undefined)
	{
		this.initialDirection = this.direction;
	}
	// if(this.size.equal(new Vector2)){
	// 	this.size = new Vector2(this.radius,this.radius);
	// }
	this.health = this.maxHealth;
	this.creationTime = new Date;
}

SCG.GO.GO.prototype = {
	constructor: SCG.GO.GO,

	hitted: function(damage) {
		//console.log('bang! ' + this.id);
		this.health -= damage;
		if(this.health <= 0) {
			this.setDead();
		}
	},
	beforeDead: function(){

	},
	setDead : function() {
		this.beforeDead();
		
		this.alive = false;
		if(this.hasPlaceable) {
			SCG.Placeable.remove(this);
		}

		var addKill = false;

		if(this instanceof SCG.GO.EnemySoldier){
			SCG.EnemySpawner.enemySoldiers.currentCount--;	
			addKill = true;
		}
		else if (this instanceof SCG.GO.EnemyLarge){
			SCG.EnemySpawner.enemyLarge.currentCount--;	
			addKill = true;
		}
		else if (this instanceof SCG.GO.EnemyVehicle)
		{
			SCG.EnemySpawner.enemyVehicle.currentCount--;	
			addKill = true;	
		}
		else if (this instanceof SCG.GO.Shot){
			SCG.Animations.createObject(this.explosionType, this.hitPoint != undefined ? this.hitPoint : this.position);
		}

		if(addKill){
			delete SCG.Placeable.enemyUnits[this.id];
			SCG.difficulty.addKill();	
		}
	},

	isAlive : function(){ 
		return this.alive;
	},

	render: function(){ 
		if(!this.alive){
			return false;
		}

		this.internalPreRender();

		if(this.img != undefined)
		{
			SCG.context.drawImage(this.img, 
				(this.renderPosition.x - this.renderSize.x/2), 
				(this.renderPosition.y - this.renderSize.y/2), 
				this.renderSize.x, 
				this.renderSize.y);	
		}

		this.internalRender();
		if(this.isDrawingHealthBar){
			this.drawHealthBar();
		}
	},

	internalPreRender: function(){

	},

	internalRender: function(){

	},

	update: function(now){ 
		
		if(!this.alive || SCG.gameLogics.isPaused || SCG.gameLogics.gameOver || SCG.gameLogics.wrongDeviceOrientation){
			return false;
		}

		// if outside - then remove
		if(this.position.x < 0 || this.position.y < 0 || this.position.x > SCG.battlefield.default.width || this.position.y > SCG.battlefield.default.height)
		{
			this.setDead();
			return false;
		}

		if(this.updatePlaceable){
			SCG.Placeable.remove(this);
		}

		this.mouseOver = false;

		this.internalPreUpdate(now);

		if(!this.alive)
		{
			return false;
		}

		if(this.destination)
		{
			if(this.position.distance(this.destination) <= this.speed){
				this.setDestination();
			}
			else{
				this.position.add(this.direction.mul(this.speed));
			}	
		}

		if(this.destination == undefined)
		{
			if(this.path.length > 0)
			{
				this.setDestination(this.path.shift());
			}

			if(this.setDeadOnDestinationComplete) {
				this.setDead();
				return false;
			}
		}
		
		//this.renderRadius = this.radius * SCG.gameControls.scale.times;
		this.renderSize = this.size.mul(SCG.gameControls.scale.times);
		this.renderPosition = new Vector2(this.position.x * SCG.gameControls.scale.times, this.position.y * SCG.gameControls.scale.times);

		this.box = new Box(new Vector2(this.position.x - this.size.x/2,this.position.y - this.size.y/2), this.size);
		//this.boundingBox = new Box(new Vector2(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2), this.renderSize);
		this.mouseOver = this.box.isPointInside(SCG.gameControls.mousestate.position.division(SCG.gameControls.scale.times));

		this.internalUpdate(now);

		if(!this.alive)
		{
			return false;
		}

		if(this.updatePlaceable){
			SCG.Placeable.set(this);
		}
	},

	internalPreUpdate: function(){

	},

	internalUpdate: function(){

	},

	setDestination: function(newDestination)
	{
		if(newDestination !== undefined && newDestination instanceof Vector2){
			if(this.randomizeDestination){
				newDestination.add(new Vector2(getRandom(-this.randomizeDestinationRadius, this.randomizeDestinationRadius), getRandom(-this.randomizeDestinationRadius, this.randomizeDestinationRadius)));
			}
			this.destination = newDestination;
			this.direction = this.position.direction(this.destination);
		}
		else{
			this.destination = undefined;
			this.direction = new Vector2;
		}
	},

	renderSelectBox: function(){
		// if(this.boundingBox === undefined)
		// {
		// 	return;
		// }

		this.boundingBox = new Box(new Vector2(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2), this.renderSize);

		if(this.selectBoxColor === undefined)
		{
			this.selectBoxColor = {max:255, min: 100, current: 255, direction:1, step: 1, colorPattern: 'rgb({0},0,0)'};
			if(this.playerControllable)
			{
				this.selectBoxColor.colorPattern = 'rgb(0,{0},0)'
			}
		}
		

		this.boundingBox.render({fill:false,strokeStyle: String.format(this.selectBoxColor.colorPattern,this.selectBoxColor.current), lineWidth: 2});
		if(this.selectBoxColor.current >= this.selectBoxColor.max || this.selectBoxColor.current <= this.selectBoxColor.min)
		{
			this.selectBoxColor.direction *=-1;
		}
		this.selectBoxColor.current+=(this.selectBoxColor.step*this.selectBoxColor.direction);
	},

	drawHealthBar: function(){
		var healthRate = this.health / this.maxHealth;
		var healthBarLength = healthRate * this.renderSize.x;
		SCG.context.beginPath();
		SCG.context.lineWidth = 3;
		var healthBarColor = 'green';
		if(healthRate >= 0.5 && healthRate < 0.75){
			healthBarColor = 'yellow';
		}
		else if(healthRate >= 0.25 && healthRate < 0.5){
			healthBarColor = 'orange';
		}
		else if(healthRate < 0.25){
			healthBarColor = 'red';
		}

		SCG.context.strokeStyle = healthBarColor;
		var topLeft = this.renderPosition.substract(this.renderSize.division(2), true);
	    SCG.context.moveTo(topLeft.x, topLeft.y);
	    SCG.context.lineTo(topLeft.x + healthBarLength, topLeft.y);
		SCG.context.stroke();	
	}
}