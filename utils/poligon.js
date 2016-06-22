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

	if(!this.renderOptions.fillStyle)
	{
		this.renderOptions.fillStyle = this.defaults.fillStyle;
	}
	else{
		this.defaults.fillStyle = this.renderOptions.fillStyle;
	}
	if(!this.renderOptions.lineWidth)
	{
		this.renderOptions.lineWidth = this.defaults.lineWidth;
	}
	else{
		this.defaults.lineWidth = this.renderOptions.lineWidth;
	}
	if(!this.renderOptions.strokeStyle)
	{
		this.renderOptions.strokeStyle = this.defaults.strokeStyle;
	}
	else{
		this.defaults.strokeStyle = this.renderOptions.strokeStyle;
	}

	if(!this.renderOptions.fill)
	{
		this.renderOptions.fill = this.defaults.fill;
	}
	else{
		this.defaults.fill = this.renderOptions.fill;
	}

	this.resetToDefaults = function(){
		this.renderOptions.fillStyle = this.defaults.fillStyle;
		this.renderOptions.strokeStyle = this.defaults.strokeStyle;
		this.renderOptions.lineWidth = this.defaults.lineWidth;
		this.renderOptions.fill = this.defaults.fill;
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
		SCG2.context.beginPath();	
		SCG2.context.moveTo(this.vertices[0].x, this.vertices[0].y);
		for(var i = 1; i< this.vertices.length; i++)
		{
			SCG2.context.lineTo(this.vertices[i].x, this.vertices[i].y);
		}

		
		SCG2.context.lineWidth = this.renderOptions.lineWidth;
		SCG2.context.strokeStyle = this.renderOptions.strokeStyle;
		SCG2.context.closePath();
		if(this.renderOptions.fill){
			SCG2.context.fillStyle = this.renderOptions.fillStyle;
			SCG2.context.fill();	
		}
		SCG2.context.stroke();
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