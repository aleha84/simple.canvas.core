SCG.GO.Button = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG.GO.Button -> position is undefined';
	}

	if(prop.cost === undefined)
	{
		throw 'SCG.GO.Button -> cost is undefined';
	}

	if(prop.type === undefined)
	{
		throw 'SCG.GO.Button -> type is undefined';
	}

	if(prop.size == undefined){ prop.size = new Vector2(30,30); }
	if(this.selectCallback == undefined){ this.selectCallback = function(){}; }

	SCG.GO.GO.call(this,prop);

	//overriding defaults and props
	this.img = SCG.images.button_inactive;
	this.id = 'Button' + (SCG.GO.Button.counter++);
	this.enabled = true;
	this.selected = false;
	this.enabledImg = SCG.images.button_active;
	this.disabledImg = SCG.images.button_inactive;
	this.selectedImg = SCG.images.button_selected;
	this.internalImage = undefined;
	this.selectedBlinkImg = SCG.images.button_selected_blink;

	this.alpha = 1;
	this.alphaBounds = [0.3,0.7]
	this.alphaDelta = 0.02;
	this.secondaryAlpha = 0.5;
	this.secondaryAlphaDelta = -0.02;
	
	this.opacyTimer = {
		lastTimeWork: new Date,
		delta : 0,
		currentDelay: 0,
		originDelay: 15,
		doWorkInternal : this.opacyChange,
		context: this
	}

	switch(this.type){
		case 'bomb':
			this.internalImage = SCG.images.bomb;
			break;
		default:
			break;
	}
}

SCG.GO.Button.counter = 0;
SCG.GO.Button.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.Button.prototype.constructor = SCG.GO.Button;

SCG.GO.Button.prototype.opacyChange = function(){ 
	this.alphaDelta *= checkClamps(this.alphaBounds, this.alpha)
	this.alpha += this.alphaDelta;

	this.secondaryAlphaDelta *= checkClamps(this.alphaBounds, this.secondaryAlpha);
	this.secondaryAlpha += this.secondaryAlphaDelta;
}

SCG.GO.Button.prototype.select = function(){ 
	this.selected = !this.selected
	this.alpha = this.selected ? 0.5 : 1;
	if(this.selected){
		this.selectCallback();
	}
}

SCG.GO.Button.prototype.internalPreUpdate = function(now){ 
	this.enabled = SCG.difficulty.money >= this.cost;

	this.img = this.enabled ? this.enabledImg : this.disabledImg;
	if(this.selected){
		this.img = this.selectedImg;
	}
}

SCG.GO.Button.prototype.internalUpdate = function(now){ 
	if(this.enabled){
		if(this.mouseOver && SCG.gameControls.mousestate.click.isClick && !SCG.defenderMenu.clicked)
		{
			this.select();

			if(this.selected){
				for(var i = 0; i< SCG.buttons.buttons.length;i++){
					if(SCG.buttons.buttons[i] != this && SCG.buttons.buttons[i].selected){
						SCG.buttons.buttons[i].select();
					}
				}
			}
		}

		if(this.selected){
			doWorkByTimer(this.opacyTimer, now);
		}	
	}
}

SCG.GO.Button.prototype.internalPreRender = function(){  
	SCG.context.save();
	SCG.context.globalAlpha = this.alpha;
}

SCG.GO.Button.prototype.internalRender = function(){  
	if(this.selected){
		SCG.context.globalAlpha = this.secondaryAlpha;

		SCG.context.drawImage(this.selectedBlinkImg, 
					(this.renderPosition.x - this.renderSize.x/2), 
					(this.renderPosition.y - this.renderSize.y/2), 
					this.renderSize.x, 
					this.renderSize.y);		
	}

	SCG.context.restore();

	SCG.context.drawImage(this.internalImage, 
				(this.renderPosition.x - this.renderSize.x/4), 
				(this.renderPosition.y - this.renderSize.y/4), 
				this.renderSize.x/2, 
				this.renderSize.y/2);	
}