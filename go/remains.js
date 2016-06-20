SCG.GO.Remains = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG.GO.Remains -> position is undefined';
	}

	SCG.GO.GO.call(this,prop);

	//overriding defaults and props
	this.id = 'Remains' + (SCG.GO.Remains.counter++);
	this.timer = {
		lastTimeWork: new Date,
		delta: 0
	}
	this.alpha = 1;
}

SCG.GO.Remains.counter = 0;
SCG.GO.Remains.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.Remains.prototype.constructor = SCG.GO.Remains;

SCG.GO.Remains.prototype.internalPreRender = function(){
	SCG.context.save();
	SCG.context.globalAlpha = this.alpha;
}

SCG.GO.Remains.prototype.internalRender = function(){
	SCG.context.restore();
}

SCG.GO.Remains.prototype.update = function(now){
	if(!this.alive){
		return;
	}

	if(SCG.gameLogics.isPaused){
		this.timer.lastTimeWork = now;
		this.timer.delta = 0;
		return;
	}

	this.renderSize = this.size.mul(SCG.gameControls.scale.times);
	this.renderPosition = new Vector2(this.position.x * SCG.gameControls.scale.times, this.position.y * SCG.gameControls.scale.times);

	this.timer.delta = now - this.timer.lastTimeWork;
	this.timeToLive -= this.timer.delta;
	if(this.timeToLive <= 0){
		//console.log(now - this.creationTime);
		this.setDead();
		return;
	}
	if(this.customUpdate != undefined){
		this.customUpdate();	
	}
	

	this.alpha = this.timeToLive / this.timeToLiveOrigin;

	this.timer.lastTimeWork = now;
}

SCG.GO.Remains.types = {
	soldier: {
		imgType: 1,
		size: new Vector2(10,10),
		timeToLive: 2000,
		timeToLiveOrigin: 2000,
		customUpdate: function() {
			this.position.y-=0.1;
		}
	},
	soldierLarge: {
		imgType: 1,
		size: new Vector2(20,20),
		timeToLive: 2000,
		timeToLiveOrigin: 2000,
		customUpdate: function() {
			this.position.y-=0.1;
		}
	},
	levelUp: {
		imgType: 2,
		size: new Vector2(15,15),
		timeToLive: 1000,
		timeToLiveOrigin: 1000,
		customUpdate: function() {
			this.position.y-=0.1;
		}
	},
	getObject: function(type, position, isPush){
		if(isPush === undefined){
			isPush = true;
		}

		var img = undefined;
		switch(SCG.GO.Remains.types[type].imgType)
		{
			case 1: 
				img = SCG.images.soldier_remains;
				break;
			case 2: 
				img = SCG.images.level_up;
				break;
			default:
				break;
		}
		var r = new SCG.GO.Remains($.extend({position: position, img: img}, SCG.GO.Remains.types[type]));
		if(isPush){
			SCG.go.push(r);	
		}
		else{
			SCG.go.unshift(r);
		}
		
	}
}