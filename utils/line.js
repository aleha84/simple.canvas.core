function Line(prop)
{
	this.begin = new Vector2;
	this.end = new Vector2;
	this.color = '#ffffff';
	this.width = 1;
	extend(this,prop);
	// if(prop.begin!=undefined)
	// {
	// 	this.begin = prop.start;
	// }
	// if(prop.end != undefined)
	// {
	// 	this.end = prop.end;
	// }
	// if(prop.color!=undefined)
	// {
	// 	this.color = prop.color;
	// }

	this.render = function  () {
		var ctx = SCG.context;
		ctx.beginPath();
		ctx.moveTo(this.begin.x, this.begin.y);
		ctx.lineTo(this.end.x, this.end.y);
		ctx.lineWidth = this.width;
		ctx.strokeStyle = this.color;
		ctx.stroke();
	}

	this.update = function  (prop) {
		extend(this,prop);
	}

	this.calculateBoundingSphere = function(){
		var center = new Vector2((this.end.x - this.begin.x)/2,(this.end.y - this.begin.y)/2)
		var radius = this.begin.distance(this.end)/2;
		return new Circle(center,radius);
	}

	this.calculateBoundingBox = function  () {
		var topLeft = new Vector2;
		topLeft.x = this.begin.x < this.end.x?  this.begin.x : this.end.x;
		topLeft.y = this.begin.y < this.end.y? this.begin.y : this.end.y;
		var size = new Vector2(Math.abs(this.end.x - this.begin.x), Math.abs(this.end.y - this.begin.x));
		return new Box(topLeft,size);
	}
}