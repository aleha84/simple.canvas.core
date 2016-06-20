SCG.GO.Menu = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG2.GO.Menu -> position is undefined';
	}

	SCG.GO.GO.call(this,prop);
	this.id = 'Menu' + (SCG.GO.Menu.counter++);
	this.items = [];
	this.parent = undefined;
	this.itemsGap = 5;
}

SCG.GO.Menu.counter = 0;
SCG.GO.Menu.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.Menu.prototype.constructor = SCG.GO.Menu;

SCG.GO.Menu.prototype.internalRender = function(){ 
	SCG.context.beginPath();
	SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
	SCG.context.fillStyle = 'yellow';
	SCG.context.fill();
	SCG.context.lineWidth = 7;
	SCG.context.strokeStyle = 'black';
	SCG.context.stroke();

	for(var i = 0;i<this.items.length;i++)
	{
		this.items[i].render();
	}

}

SCG.GO.Menu.prototype.setItems = function(items)
{
	if(items == undefined)
	{
		return;
	}

	var totalWidth = this.itemsGap;
	var totalHeight = 0;

	for(var i = 0; i<items.length;i++)
	{
		items[i].parent = this;
		totalWidth+=(items[i].size.x + this.itemsGap);
		if(totalHeight < items[i].size.y)
		{
			totalHeight = items[i].size.y;
		}
	}

	var relToZero = new Vector2((0 - totalWidth/2)+this.itemsGap, 0);

	this.size = new Vector2(totalWidth, totalHeight + this.itemsGap*2);

	for(var i = 0; i<items.length;i++)
	{
		items[i].position = relToZero.clone().add(new Vector2(items[i].size.x/2,0),true);
		relToZero.x += (items[i].size.x + this.itemsGap);
	}
	
	this.items = items;
}

SCG.GO.Menu.prototype.internalPreUpdate = function(){ 
	// if(this.parent!=undefined)
	// {
	// 	this.position = this.parent.position.substract(new Vector2(0,this.size.y*0.75),true);	
	// }
	
}

SCG.GO.Menu.prototype.internalUpdate = function(now){ 
	for(var i = 0;i<this.items.length;i++)
	{
		this.items[i].update();
	}
}