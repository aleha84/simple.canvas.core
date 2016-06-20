SCG.GO.MenuItem = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG2.GO.MenuItem -> position is undefined';
	}
	if(prop.text === undefined) { prop.text = []; }//{ prop.text = [{ text: 'text1', style :{ color: 'red', size: 10 }}, { text: 'text2', style :{ color: 'blue', size: 5 }}]; }

	this.clickCallback = function() { console.log('default callback'); }

	SCG.GO.GO.call(this,prop);
	this.id = 'MenuItem' + (SCG.GO.MenuItem.counter++);
	this.items = [];
	this.parent = undefined;
	this.itemsGap = 5;
	this.defaultColor = 'red';
	this.defaultFontSize = 10;
	this.defaultLineHeight = 12*SCG.gameControls.scale.times;
	this.padding = new Vector2(5*SCG.gameControls.scale.times,5*SCG.gameControls.scale.times);
	for(var i = 0; i < this.text.length; i++){
		if(this.text[i].style == undefined){
			this.text[i].style = {};
		}

		if(this.text[i].style.color == undefined){
			this.text[i].style.color = this.defaultColor;
		}
		if(this.text[i].style.size == undefined){
			this.text[i].style.size = this.defaultFontSize;
		}
	}
}

SCG.GO.MenuItem.counter = 0;
SCG.GO.MenuItem.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.MenuItem.prototype.constructor = SCG.GO.MenuItem;

SCG.GO.MenuItem.prototype.internalRender = function(){ 
	if(this.mouseOver)
	{
		this.renderSelectBox();
	}

	var topLeft = this.renderPosition.substract(new Vector2(this.renderSize.x/2,this.renderSize.y/2), true).add(this.padding, true);

	if(this.text != undefined || this.text.length > 0){
		for(var i = 0; i < this.text.length; i++){
			var fontSize = this.text[i].style.size * SCG.gameControls.scale.times;
			SCG.context.font = fontSize + "px Arial";
			SCG.context.fillStyle = this.text[i].style.color;
			SCG.context.fillText(this.text[i].text, topLeft.x, topLeft.y);	

			topLeft.y+=fontSize;
		}
	}
}

SCG.GO.MenuItem.prototype.internalUpdate = function(){ 
	if(this.mouseOver && SCG.gameControls.mousestate.click.isClick && !SCG.defenderMenu.clicked)
	{
		this.clickCallback(this);
	}
}