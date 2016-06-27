SCG.GO = {};

SCG.GO.GO = function(prop){
	this.defaultInitProperties = {};
	this.position = new Vector2;
	this.renderPosition = new Vector2;
	this.alive = true;
	this.type = 'unidentifiedType';
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
	this.setDeadOnDestinationComplete = false;
	this.health = 1;
	this.maxHealth = 1;
	this.isDrawingHealthBar = false;
	this.isCustomRender = false;

	this.isAnimated = false;
	this.animation = {
		totalFrameCount: 0,
		framesInRow: 0,
		framesRowsCount: 0,
		frameChangeDelay: 0,
		destinationFrameSize: new Vector2,
		sourceFrameSize: new Vector2,
		currentDestination : new Vector2,
		currentFrame: 0,
		loop : false,
		animationTimer : {
			lastTimeWork: new Date,
			delta : 0,
			currentDelay: this.animation.frameChangeDelay,
			originDelay: this.animation.frameChangeDelay,
			doWorkInternal : this.animation.frameChange,
			context: this
		},
		frameChange : function(){
			this.animation.currentFrame++;
			if(this.animation.currentFrame > this.animation.totalFrameCount){
				if(this.animation.loop){
					this.animation.currentFrame = 1;
				}
				else{
					this.setDead();
					return;
				}
			}
			var crow = this.animation.framesRowsCount - parseInt((this.animation.totalFrameCount - this.animation.currentFrame) / this.animation.framesInRow);
			var ccol = this.animation.framesInRow + parseInt((this.animation.currentFrame - (this.animation.framesInRow * crow)));
			this.animation.currentDestination = new Vector2(ccol - 1, crow - 1);
		}
	};

	if(prop == undefined)
	{
		throw 'SCG.GO.GO -> props are undefined';
	}

	if(prop.size == undefined || prop.size.equal(new Vector2))
	{
		throw 'SCG.GO.GO -> size is undefined';
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

	if(this.isAnimated){
		this.size = this.animation.destinationFrameSize.clone();
		this.animation.currentFrame = 0;
	}

	this.health = this.maxHealth;
	this.creationTime = new Date;

	if(SCG.GO.GO.counter[this.type] == undefined)
	{
		SCG.GO.GO.counter[this.type] = 0;	
	}

	this.id = this.type + (++SCG.GO.GO.counter[this.type]);
}

SCG.GO.GO.counter = {};

SCG.GO.GO.prototype = {
	constructor: SCG.GO.GO,

	beforeDead: function(){

	},
	setDead : function() {
		this.beforeDead();
		
		this.alive = false;
	},

	isAlive : function(){ 
		return this.alive;
	},

	render: function(){ 
		if(!this.alive || !this.renderPosition){
			return false;
		}

		this.internalPreRender();

		if(this.isCustomRender)
		{
			this.customRender();
		}
		else{
			if(this.img != undefined)
			{
				if(this.isAnimated)
				{
					SCG.context.drawImage(this.img,  
						this.animation.currentDestination.x * this.animation.sourceFrameSize.x,
						this.animation.currentDestination.y * this.animation.sourceFrameSize.y,
						this.animation.sourceFrameSize.x,
						this.animation.sourceFrameSize.y,
						this.renderPosition.x - this.renderSize.x/2,
						this.renderPosition.y - this.renderSize.y/2,
						this.renderSize.x,
						this.renderSize.y
					);
				}
				else{
					SCG.context.drawImage(this.img, 
						(this.renderPosition.x - this.renderSize.x/2), 
						(this.renderPosition.y - this.renderSize.y/2), 
						this.renderSize.x, 
						this.renderSize.y);		
				}
			}	
		}

		this.internalRender();
	},

	customRender: function(){

	},

	internalPreRender: function(){

	},

	internalRender: function(){

	},

	update: function(now){ 
		
		if(!this.alive || SCG.gameLogics.isPaused || SCG.gameLogics.gameOver || SCG.gameLogics.wrongDeviceOrientation){
			return false;
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
				this.position.add(this.direction.mul(this.speed), true);
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
		

		this.renderSize = this.size.mul(SCG.gameControls.scale.times);

		this.box = new Box(new Vector2(this.position.x - this.size.x/2,this.position.y - this.size.y/2), this.size); //absolute positioning box

		this.renderPosition = undefined;
		if(SCG.viewfield.current.isIntersectsWithBox(this.box))
		{
			this.renderPosition = new Vector2(this.position.x * SCG.gameControls.scale.times, this.position.y * SCG.gameControls.scale.times).add(SCG.viewfield.current.topLeft.mul(-1));
		}

		//this.boundingBox = new Box(new Vector2(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2), this.renderSize);
		//this.mouseOver = this.box.isPointInside(SCG.gameControls.mousestate.position.division(SCG.gameControls.scale.times));

		if(this.isAnimated)
		{
			doWorkByTimer(this.animation.animationTimer, now);
		}

		this.internalUpdate(now);

		if(!this.alive)
		{
			return false;
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
				newDestination.add(new Vector2(getRandom(-this.randomizeDestinationRadius, this.randomizeDestinationRadius), getRandom(-this.randomizeDestinationRadius, this.randomizeDestinationRadius)), true);
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
}