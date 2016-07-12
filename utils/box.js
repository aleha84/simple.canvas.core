function Box(topLeft,size){
	this.topLeft = topLeft;
	this.size = size;
	this.center = new Vector2(this.topLeft.x + (size.x/2), this.topLeft.y + (size.y/2));
	this.bottomRight = new Vector2(this.topLeft.x + this.size.x,this.topLeft.y+this.size.y);

	this.topRight = new Vector2(this.bottomRight.x, this.topLeft.y);
	this.bottomLeft = new Vector2(this.topLeft.x, this.bottomRight.y);
	
	this.update = function(topLeft,size){
		this.topLeft = topLeft;
		if(size!== undefined)
		{
			this.size = size;
		}
		this.center = new Vector2(this.topLeft.x + (this.size.x/2), this.topLeft.y + (this.size.y/2));
		this.bottomRight = new Vector2(this.topLeft.x + this.size.x,this.topLeft.y+this.size.y);
	}
	this.isPointInside = function(point){
		return point instanceof Vector2 &&
			   this.topLeft.x <= point.x && point.x <= this.bottomRight.x && 
			   this.topLeft.y <= point.y && point.y <= this.bottomRight.y;

	}

	this.isIntersectsWithCircle = function(circle)
	{
		return boxCircleIntersects(circle,this);
	}

	this.isIntersectsWithBox = function(box)
	{
		//return this.isPointInside(box.topLeft) || this.isPointInside(box.bottomRight);
		return boxIntersectsBox(this,box);
	}

	this.render = function  (options) {
		var prop = {
			fillStyle:'rgba(0, 255, 0, 0.5)', 
			lineWidth: 1,
			strokeStyle: '#00FF00',
		};
		if(isBoolean(options)){
			prop.fill = options;
		}
		else{
			extend(prop, options);
		}
		SCG.context.beginPath();	
		SCG.context.rect(this.topLeft.x, this.topLeft.y, this.size.x, this.size.y);
		if(prop.fill){
			SCG.context.fillStyle = prop.fillStyle;
			SCG.context.fill();	
		}
		SCG.context.lineWidth = prop.lineWidth;
		SCG.context.strokeStyle = prop.strokeStyle;
		SCG.context.closePath();
		SCG.context.stroke();
	}
}

