function Poligon(init)
{
	this.vertices = init.vertices;
	this.renderOptions = init.renderOptions;

	this.defaults = {
		fillStyle : 'rgba(255, 255, 0, 0.5)',
		strokeStyle : '#FF0000',
		lineWidth : 2,
		fill : false
	}

	if(this.vertices.length < 3)
	{
		throw 'Poligon -> vertices lenght mustbe >= 3';
	}

	if(!this.renderOptions)
	{
		this.renderOptions = {};
	}

	var ro = this.renderOptions;
	if(!ro.fillStyle)
	{
		ro.fillStyle = this.defaults.fillStyle;
	}
	else{
		this.defaults.fillStyle = ro.fillStyle;
	}
	if(!ro.lineWidth)
	{
		ro.lineWidth = this.defaults.lineWidth;
	}
	else{
		this.defaults.lineWidth = ro.lineWidth;
	}
	if(!ro.strokeStyle)
	{
		ro.strokeStyle = this.defaults.strokeStyle;
	}
	else{
		this.defaults.strokeStyle = ro.strokeStyle;
	}

	if(!ro.fill)
	{
		ro.fill = this.defaults.fill;
	}
	else{
		this.defaults.fill = ro.fill;
	}

	this.resetToDefaults = function(){
		ro.fillStyle = this.defaults.fillStyle;
		ro.strokeStyle = this.defaults.strokeStyle;
		ro.lineWidth = this.defaults.lineWidth;
		ro.fill = this.defaults.fill;
	}

	this.clone = function(){
		return new Poligon({vertices: this.vertices.map(function(v){ return v.clone()})});
	}

	this.update = function(shift, angle){
		for (var i = this.vertices.length - 1; i >= 0; i--) {
			this.vertices[i].rotate(angle,true,true);
			this.vertices[i].add(shift, true);
		};
	}

	this.render = function(){
		var ctx = SCG.context;
		ctx.beginPath();	
		ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
		for(var i = 1; i< this.vertices.length; i++)
		{
			ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
		}

		
		ctx.lineWidth = this.renderOptions.lineWidth;
		ctx.strokeStyle = this.renderOptions.strokeStyle;
		ctx.closePath();
		if(this.renderOptions.fill){
			ctx.fillStyle = this.renderOptions.fillStyle;
			ctx.fill();	
		}
		ctx.stroke();
	}

	this.isPointInside = function(point){
		var collisionCount = 0;

		var maxX = point.x;
		for(var i = 0; i < this.vertices.length; i++)
		{
			if(this.vertices[i].x > maxX)
			{
				maxX = this.vertices[i].x;
			}
		}
		maxX +=1;

		for(var i = 0; i < this.vertices.length; i++)
		{
			var begin = this.vertices[i].clone();
			var end = this.vertices[(i == (this.vertices.length - 1) ? 0: i + 1)].clone();

			if(point.y == begin.y) { begin.y -= 0.01; }
			if(point.y == end.y) { end.y -= 0.01; }

			if(segmentsIntersectionVector2(
				new Line({begin: point, end: new Vector2(maxX, point.y)}), 
				new Line({begin: begin, end: end}))
				)
			{
				collisionCount++;
			}
		}

		return collisionCount > 0 && collisionCount % 2 != 0;

	}
}