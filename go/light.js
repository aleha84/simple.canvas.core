SCG.GO.Light = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG2.GO.Light -> position is undefined';
	}

	SCG.GO.GO.call(this,prop);
	this.id = 'Light' + (SCG.GO.Light.counter++);

	var canvas = document.createElement("canvas");
	canvas.id = this.id;
	canvas.width = this.size.x;
	canvas.height = this.size.y;
	canvas.style.display = 'none';
	document.body.appendChild(canvas);

	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	
	if(this.statrtingCircleCenter === undefined)
	{
		this.statrtingCircleCenter = new Vector2(this.size.x/2, this.size.y/2);	
	}
	
	if(this.endingCircleCenter === undefined)
	{
		this.endingCircleCenter = new Vector2(this.size.x/2, this.size.y/2);	
	}
	
	if(this.defaultRadiuses === undefined)
	{
		this.defaultRadiuses = [1, this.radius/2];	
	}
	
	this.startingRadius = this.defaultRadiuses[0];
	this.endingRadius = this.defaultRadiuses[1];

	if(this.endingRadiusClamps === undefined)
	{
		this.endingRadiusClamps = this.defaultRadiuses;
	}

	if(this.colorStops === undefined)
	{
		this.colorStops = [
			{ offset: 0, color: 'rgba(255,255,255,0.8)' },
			{ offset: 1, color: 'rgba(255,255,255,0)' },
		]
	}

	if(this.endingRadiusDelta == undefined)
	{
		this.endingRadiusDelta = -0.5;
	}

	this.internalRender();
	this.img = this.canvas;
}

SCG.GO.Light.counter = 0;
SCG.GO.Light.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.Light.prototype.constructor = SCG.GO.Light;

SCG.GO.Light.prototype.setDead = function(){ 
	this.alive = false;
	// remove canvas
	$('#' + this.id).remove();
}

SCG.GO.Light.prototype.internalRender = function(){ 
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	var g = this.context.createRadialGradient(this.statrtingCircleCenter.x, this.statrtingCircleCenter.y, this.startingRadius, this.endingCircleCenter.x, this.endingCircleCenter.y, this.endingRadius);

	for(var i = 0; i < this.colorStops.length; i++)	
	{
		g.addColorStop(this.colorStops[i].offset, this.colorStops[i].color);	
	}
    this.context.fillStyle = g;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

SCG.GO.Light.prototype.internalUpdate = function(now){ 
	if(this.iterationCount == undefined)
	{
		this.iterationCount = 0;	
	}

	if((this.endingRadiusDelta < 0 && this.endingRadiusClamps[0] > (this.endingRadius + this.endingRadiusDelta)) 
		|| (this.endingRadiusDelta > 0 && this.endingRadiusClamps[1] < (this.endingRadius+this.endingRadiusDelta)))
	{
		this.endingRadiusDelta*=-1;
		if(this.endingRadiusDelta > 0)
		{
			this.iterationCount++;
		}

		// if(this.iterationCount > 3)
		// {
		// 	this.setDead();
		// 	var testLight =  new SCG.GO.Light({
		// 		position: new Vector2(getRandom(12,SCG.battlefield.default.width-12),getRandom(12, SCG.battlefield.default.height)),
		// 		radius: getRandom(50,100),
		// 	});
		// 	SCG.go.push(testLight);	
		// }
	}

	this.endingRadius += this.endingRadiusDelta;
}