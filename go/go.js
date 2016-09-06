SCG.GO = {};

SCG.GO.GO = function(prop){
	this.defaultInitProperties = {};
	this.position = new V2;
	this.renderPosition = new V2;
	this.renderBox = undefined;
	this.alive = true;
	this.static = false;
	this.type = 'unidentifiedType';
	this.id = '';
	this.size = new V2;
	this.renderSize = new V2;
	this.direction = new V2;
	this.speed = 0;
	this.angle = 0;
	this.context = undefined;
	this.contextName = 'context';

	this.img = undefined;
	this.imgPropertyName = undefined;
	this.selected = false;
	this.playerControllable =false;
	this.destination = undefined;
	this.path = [];
	this.mouseOver = false;
	this.randomizeDestination = false;
	this.randomizeDestinationRadius = new V2;
	this.setDeadOnDestinationComplete = false;
	this.isCustomRender = false;

	this.handlers = {};

	this.isAnimated = false;
	this.animation = {
		totalFrameCount: 0,
		framesInRow: 0,
		framesRowsCount: 0,
		frameChangeDelay: 0,
		destinationFrameSize: new V2,
		sourceFrameSize: new V2,
		currentDestination : new V2,
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
			ani.currentDestination = new V2(ccol - 1, crow - 1);
		}
	};

	if(prop == undefined)
	{
		throw 'SCG.GO.GO -> props are undefined';
	}

	if(prop.size == undefined || prop.size.equal(new V2))
	{
		throw 'SCG.GO.GO -> size is undefined';
	}

	extend(true, this, prop);

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

	this.creationTime = new Date;

	this.regClick();

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
			if(this.img != undefined)
			{
				var rp = this.renderPosition;
				var rs = this.renderSize;
				var dsp = this.destSourcePosition;
				var s = this.size;
				var ctx = this.context;
				if(this.isAnimated)
				{
					var ani = this.animation;
					ctx.drawImage(this.img,  
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
					if(dsp != undefined){
						var destSourceSize = this.destSourceSize ? this.destSourceSize : this.size;
						ctx.drawImage(this.img, 
							dsp.x,
							dsp.y,
							destSourceSize.x,
							destSourceSize.y,
							(rp.x - rs.x/2), 
							(rp.y - rs.y/2), 
							rs.x, 
							rs.y);		
					}
					else {
						ctx.drawImage(this.img, 
							(rp.x - rs.x/2), 
							(rp.y - rs.y/2), 
							rs.x, 
							rs.y);			
					}
					
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
		var scale = SCG.gameControls.scale;
		this.renderSize = this.size.mul(scale.times);

		this.box = new Box(new V2(this.position.x - this.size.x/2,this.position.y - this.size.y/2), this.size); //absolute positioning box

		this.renderPosition = undefined;
		if(SCG.viewfield.current.isIntersectsWithBox(this.box) || this.static)
		{
			this.renderPosition = this.position.add(this.static ? new V2 : SCG.viewfield.current.topLeft.mul(-1)).mul(scale.times);
			this.renderBox = new Box(new V2(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2), this.renderSize);
		}

		if(this.img == undefined && this.imgPropertyName != undefined){ //first run workaround
			this.img = SCG.images[this.imgPropertyName];
			if(this.img == undefined){
				throw 'Cant achieve image named: ' + this.imgPropertyName;
			}
		}

		if(this.context == undefined && this.contextName != undefined){
			this.context = SCG.contexts[this.contextName];
			if(this.context == undefined){
				throw 'Cant achieve context named: ' + this.contextName;
			}
		}

		if(!this.static && (!this.alive || SCG.gameLogics.isPaused || SCG.gameLogics.gameOver || SCG.gameLogics.wrongDeviceOrientation)){
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
			else if(this.setDeadOnDestinationComplete) {
				this.setDead();
				return false;
			}
		}
		

		//this.boundingBox = new Box(new V2(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2), this.renderSize);
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
		if(newDestination !== undefined && newDestination instanceof V2){
			if(this.randomizeDestination){
				var rdr = this.randomizeDestinationRadius;
				newDestination.add(new V2(getRandom(-rdr, rdr), getRandom(-rdr, rdr)), true);
			}
			this.destination = newDestination;
			this.direction = this.position.direction(this.destination);
		}
		else{
			this.destination = undefined;
			this.direction = new V2;
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

	clickHandler: function(){},

	regClick: function(){
		//register click for new objects
		if(this.handlers.click && isFunction(this.handlers.click)){
			var eh = SCG.gameControls.mousestate.eventHandlers;
			if(eh.click.indexOf(this) == -1){
				eh.click.push(this);
			}
		}
	}
}