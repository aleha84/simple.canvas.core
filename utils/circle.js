function Circle (center, radius) {
	if(center instanceof Vector2){
		this.center = center;
		this.radius = radius;	
	}
	else if(center instanceof Object && center.center !== undefined && center.radius !== undefined)
	{
		this.center = center.center;
		this.radius = center.radius;	
	}
	
	this.update = function(radius){
		this.radius = radius;
	}

	this.render = function(options, color){
		var prop = {
			fillStyle:'rgba(255, 255, 0, 0.5)', 
			lineWidth: 1,
			strokeStyle: '#FFFF00',
		};
		if(isBoolean(options)){
			prop.fill = options;
		}
		else{
			$.extend(prop, options);
		}

		if(color!==undefined && isString(color))
		{
			prop.fillStyle = color;
			prop.strokeStyle = color;
		}
		SCG2.context.beginPath();
		SCG2.context.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI, false);
		if(prop.fill){
			SCG2.context.fillStyle = prop.fillStyle;
			SCG2.context.fill();	
		}
		SCG2.context.lineWidth = prop.lineWidth;
		SCG2.context.strokeStyle = prop.strokeStyle;
		SCG2.context.stroke();
	}

	this.clone = function(){
		return new Circle(this.center, this.radius);
	}
}