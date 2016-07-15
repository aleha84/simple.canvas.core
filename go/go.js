SCG.GO = {};

SCG.GO.GO = function(prop){
	this.defaultInitProperties = {};
	this.position = new Vector2;
	this.renderPosition = new Vector2;
	this.renderBox = undefined;
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
	this.imgPropertyName = undefined;
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

	this.handlers = {};

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
		reverse: false,
		paused: false,
		loop : false,
		animationTimer : undefined,
		animationEndCallback: function(){},
		frameChange : function(){
			var ani = this.animation;
			if(ani.paused){
				return;
			}

			if(ani.reverse){
				ani.currentFrame--;	
			}
			else
			{
				ani.currentFrame++;
			}

			if((!ani.reverse && ani.currentFrame > ani.totalFrameCount)
				|| (ani.reverse && ani.currentFrame < 1)
				){
				if(ani.loop){
					ani.currentFrame = ani.reverse? ani.totalFrameCount :  1;
				}
				else{
					ani.animationEndCallback.call(this);
					//this.setDead();
					return;
				}
			}
			var crow = Math.ceil(ani.currentFrame/ani.framesInRow);
			var ccol = ani.framesInRow - ((crow*ani.framesInRow) - ani.currentFrame);
			ani.currentDestination = new Vector2(ccol - 1, crow - 1);
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
		extend(true, this, prop);
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
		this.animation.animationTimer = {
			lastTimeWork: new Date,
			delta : 0,
			currentDelay: this.animation.frameChangeDelay,
			originDelay: this.animation.frameChangeDelay,
			doWorkInternal : this.animation.frameChange,
			context: this
		};
	}

	if(SCG.GO.GO.counter[this.type] == undefined)
	{
		SCG.GO.GO.counter[this.type] = 0;	
	}
	this.id = this.type + (++SCG.GO.GO.counter[this.type]);

	this.health = this.maxHealth;
	this.creationTime = new Date;

	//register click for new objects
	if(this.handlers.click && isFunction(this.handlers.click)){
		var eh = SCG.gameControls.mousestate.eventHandlers;
		if(eh.click.indexOf(this) == -1){
			eh.click.push(this);
		}
	}

	if(this.initializer != undefined && isFunction(this.initializer)){
		this.initializer(this);
	}

	if(this.img == undefined && this.imgPropertyName != undefined){ 
		this.img = SCG.images[this.imgPropertyName];
	}

	if(SCG.AI.worker){
		SCG.AI.sendEvent({ type: 'created', message: {goType: this.type, id: this.id, position: this.position.clone() }});	
	}
	
}

SCG.GO.GO.counter = {};

SCG.GO.GO.prototype = {
	constructor: SCG.GO.GO,

	beforeDead: function(){

	},
	setDead : function() {
		this.beforeDead();
		
		//remove from event handlers
		var eh = SCG.gameControls.mousestate.eventHandlers;
		var index = eh.click.indexOf(this);
		if(index > -1){
			eh.click.splice(index, 1);	
		}
		

		//send to ai msg
		if(SCG.AI.worker){
			SCG.AI.sendEvent({ type: 'removed', message: {goType: this.type, id: this.id }});	
		}

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
			if(this.img == undefined && this.imgPropertyName != undefined){ //first run workaround
				this.img = SCG.images[this.imgPropertyName];
				if(this.img == undefined){
					throw 'Cant achieve image named: ' + this.imgPropertyName;
				}
			}


			if(this.img != undefined)
			{
				var rp = this.renderPosition;
				var rs = this.renderSize;
				if(this.isAnimated)
				{
					var ani = this.animation;
					SCG.context.drawImage(this.img,  
						ani.currentDestination.x * ani.sourceFrameSize.x,
						ani.currentDestination.y * ani.sourceFrameSize.y,
						ani.sourceFrameSize.x,
						ani.sourceFrameSize.y,
						rp.x - rs.x/2,
						rp.y - rs.y/2,
						rs.x,
						rs.y
					);
				}
				else{
					SCG.context.drawImage(this.img, 
						(rp.x - rs.x/2), 
						(rp.y - rs.y/2), 
						rs.x, 
						rs.y);		
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
			this.renderBox = new Box(new Vector2(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2), this.renderSize);
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

	internalUpdate: function(now){

	},

	setDestination: function(newDestination)
	{
		if(newDestination !== undefined && newDestination instanceof Vector2){
			if(this.randomizeDestination){
				var rdr = this.randomizeDestinationRadius;
				newDestination.add(new Vector2(getRandom(-rdr, rdr), getRandom(-rdr, rdr)), true);
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

		var sbc = this.selectBoxColor;
		if(sbc === undefined)
		{
			sbc = {max:255, min: 100, current: 255, direction:1, step: 1, colorPattern: 'rgb({0},0,0)'};
			if(this.playerControllable)
			{
				sbc.colorPattern = 'rgb(0,{0},0)'
			}
		}
		

		this.renderBox.render({fill:false,strokeStyle: String.format(sbc.colorPattern,sbc.current), lineWidth: 2});
		if(sbc.current >= sbc.max || sbc.current <= sbc.min)
		{
			sbc.direction *=-1;
		}
		sbc.current+=(sbc.step*sbc.direction);
	},

	clickHandler: function(){}
}