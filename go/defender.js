SCG.GO.DefenderState = {
	empty: {
		name: 'empty',
		upgradeTo : 'woodenFence',
		upgradeCost : 300,
		img: undefined,
		maxDefendersCount: 1,
		// lightProp : {
		// 	position: new Vector2,
		// 	size: new Vector2(30,30),
		// 	defaultRadiuses : [0, 20],
		// 	colorStops : [
		// 		{ offset: 0, color: 'rgba(255,255,255,0)' },
		// 		//{ offset: 0.1, color: 'rgba(255,255,255,0.5)' },
		// 		{ offset: 0.5, color: 'rgba(255,255,255,0.8)' },
		// 		{ offset: 1, color: 'rgba(255,255,255,0)' },
		// 	],
		// 	endingRadiusClamps : [17,20],
		// 	endingRadiusDelta : -0.25
		// }
	},
	woodenFence: {
		name: 'woodenFence',
		img: undefined,
		upgradeTo : 'stoneBarrier',
		upgradeCost : 500,
		maxDefendersCount : 2,
	},
	stoneBarrier: {
		name: 'stoneBarrier',
		img: undefined,
		maxDefendersCount : 3,
		upgradeCost : 800,
		upgradeTo : 'debrishDefence',
	},
	debrishDefence : {
		name: 'debrishDefence',
		img: undefined,
		maxDefendersCount : 4,
	},
	positions: [new Vector2(300,90), new Vector2(300,200), new Vector2(220,150), new Vector2(80,150), new Vector2(190,25), new Vector2(200,260), new Vector2(30,80), new Vector2(30,220)],
	init: function(){
		this.empty.img = SCG.images.placeholder;
		this.woodenFence.img = SCG.images.wooden_fence;
		this.stoneBarrier.img = SCG.images.stone_barrier;
		this.debrishDefence.img = SCG.images.debrish_defence;
	}
}

SCG.GO.Defender = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG.GO.Defender -> position is undefined';
	}
	if(prop.size == undefined){prop.size = new Vector2(30,30); }
	SCG.GO.GO.call(this,prop);
	this.id = 'Defender' + (SCG.GO.Defender.counter++);

	this.state = undefined;
	this.light = undefined;
	this.menu = undefined;
	this.updatePlaceable = false;
	this.hasPlaceable = true;
	this.shouldRenderMenu = false;
	this.side = 1;
	this.defenderSoldiers = [];
	SCG.Placeable.set(this);
	SCG.Placeable.playerUnits[this.id] = this;

	this.setState();
}

SCG.GO.Defender.counter = 0;
SCG.GO.Defender.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.Defender.prototype.constructor = SCG.GO.Defender;

SCG.GO.Defender.prototype.setMenu = function(menu)
{
	menu.parent = this;
	menu.position = this.position.substract(new Vector2(0,menu.size.y/2+this.size.y/2),true)
	var xDelta = menu.position.x - menu.size.x/2;
	if(xDelta < 0) {
		menu.position.x += -1*xDelta;
	}

	var yDelta = menu.position.y - menu.size.y/2;
	if(yDelta < 0){
		menu.position.y = this.position.y + (menu.size.y/2+this.size.y/2);
	}

	for(var i=0;i<menu.items.length;i++)
	{
		menu.items[i].position = menu.position.add(menu.items[i].position,true);
	}

	SCG.defenderMenu.menu = menu;
}

SCG.GO.Defender.prototype.upgrade = function()
{
	if(this.state.upgradeTo == undefined ){ return; }
	 this.setState(SCG.GO.DefenderState[this.state.upgradeTo]);
}

SCG.GO.Defender.prototype.removeDefender = function(defenderSoldierId)
{
	for(var i = 0; i< this.defenderSoldiers.length; i++){
		if(this.defenderSoldiers[i].id == defenderSoldierId){
			this.defenderSoldiers.splice(i,1);
		}
	}

	//this.createMenuItems();
}

SCG.GO.Defender.prototype.addDefender = function(type)
{
	if(this.defenderSoldiers.length < this.state.maxDefendersCount)
	{

		if(this.defenderSoldiers.length == 0)
		{
			this.defenderSoldiers.push(new SCG.GO.DefenderSoldier({position: this.position.clone(), parent: this, type: type}));
		}
		else{
			var angleStep = 360 / (this.defenderSoldiers.length + 1);
			var radius = (this.size.x / 2) * 0.3;
			var up = new Vector2(0, -radius);
			for(var i = 0;i<this.defenderSoldiers.length; i++)
			{
				this.defenderSoldiers[i].position = up.rotate(angleStep*i).add(this.position,true);
			}

			this.defenderSoldiers.push(new SCG.GO.DefenderSoldier({position: up.rotate(angleStep*this.defenderSoldiers.length).add(this.position,true), parent: this, type: type}));
		}

		//this.createMenuItems();
	}
}

SCG.GO.Defender.prototype.createMenuItems = function() {
	var items = [
				//new SCG.GO.MenuItem({size: new Vector2(40,40), position: new Vector2, img: SCG.images.cross, clickCallback: function() { console.log('cancel clicked'); }})
			];

	if(this.state.upgradeTo != undefined){
		(function(cost) {
			if(SCG.difficulty.money >= cost){
			items.push(
				new SCG.GO.MenuItem({size: new Vector2(50,50), position: new Vector2, img: SCG.images.upgrade,
					text: [{ text: 'Cost: ' + cost }], 
					clickCallback: function(context) { 
						if(context && context.parent && context.parent.parent && context.parent.parent instanceof SCG.GO.Defender)
						{
							SCG.difficulty.money-=cost;
							context.parent.parent.upgrade();
						}
				}}));	
			}
		})(this.state.upgradeCost)
	}

	if(this.defenderSoldiers.length < this.state.maxDefendersCount){
		var types = ['gunner', 'sniper', 'rpg', 'machine-gunner'];
		for(var j = 0; j< types.length;j++){
			(function(_j) {
				var cost = SCG.difficulty.costs[types[_j]].getCost();
				if(SCG.difficulty.money >= cost){ 
					items.push(
					new SCG.GO.MenuItem({size: new Vector2(50,50), position: new Vector2, img: SCG.images['add_'+types[_j]], 
						text: [{ text: 'Cost: ' + cost }],
						clickCallback: function(context) {  
							if(context && context.parent && context.parent.parent && context.parent.parent instanceof SCG.GO.Defender)
							{
								SCG.difficulty.money-=cost;
								context.parent.parent.addDefender(types[_j]);
							}
						}}));
				}
			})(j);
		}
	}

	for(var i = 0; i < this.defenderSoldiers.length; i++){
		(function(ds){
			var cost = SCG.difficulty.costs[ds.type].getRefund(ds.level);
			items.push(
			new SCG.GO.MenuItem({size: new Vector2(50,50), position: new Vector2, img: SCG.images['remove_'+ds.type], 
				text: [{ text: 'Ref: ' + cost }, { text: 'Lvl: ' + (ds.level+1), style: { color: '#05FF2E', size: 10 } }],
				clickCallback: function(context) {  
					if(context && context.parent && context.parent.parent && context.parent.parent instanceof SCG.GO.Defender)
					{
						SCG.difficulty.money+=cost;
						context.parent.parent.removeDefender(ds.id);
					}
				}}));
		})(this.defenderSoldiers[i])
	}

	var menu = new SCG.GO.Menu({size: new Vector2(100,20), position: new Vector2});

	menu.setItems(items);	

	this.setMenu(menu);	
}

SCG.GO.Defender.prototype.setState = function(state)
{
	if(state === undefined)
	{
		state = SCG.GO.DefenderState.empty;
	}

	this.state = state;
	this.img = state.img;

	// var menu = new SCG.GO.Menu({size: new Vector2(100,20), position: new Vector2});
	// if(state.getMenuItems){
	// 	menu.setItems(state.getMenuItems());	
	// }

	// this.setMenu(menu);

	//this.createMenuItems();

	// if(this.state.lightProp != undefined)
	// {
	// 	this.state.lightProp.radius = this.size.x;
	// 	this.state.lightProp.position = new Vector2(this.state.lightProp.radius/2 - this.size.x/2,this.state.lightProp.radius/2 - this.size.y/2);
	// 	this.state.lightProp.defaultRadiuses[1] = this.size.x; 
	// 	this.state.lightProp.endingRadiusClamps[0] = this.size.x*0.6; 
	// 	this.state.lightProp.endingRadiusClamps[1] = this.size.x*0.8; 
	// 	this.light = new SCG.GO.Light(this.state.lightProp)
	// }
}

SCG.GO.Defender.prototype.internalPreRender = function(){ 
	if(this.light != undefined)
	{
		SCG.context.translate(this.renderPosition.x,this.renderPosition.y);

		this.light.render();

		SCG.context.translate(-this.renderPosition.x,-this.renderPosition.y);
	}
}

SCG.GO.Defender.prototype.internalRender = function(){ 
	for(var i = 0; i< this.defenderSoldiers.length; i++)
	{
		this.defenderSoldiers[i].render();
	}

	// if(this.shouldRenderMenu && this.menu != undefined)
	// {
	// 	this.menu.render();
	// }
}

SCG.GO.Defender.prototype.internalPreUpdate = function(){ 
	if(this.light != undefined)
	{
		this.light.update();
	}
}

SCG.GO.Defender.prototype.internalUpdate = function(now){ 
	//this.shouldRenderMenu = (SCG.gameControls.mousestate.leftButtonDown || SCG.gameControls.mousestate.click.isClick) && (this.mouseOver || this.menu.mouseOver);
	// if(this.shouldRenderMenu && this.menu != undefined)
	// {
	// 	this.menu.update();
	// }

	if(this.mouseOver && SCG.gameControls.mousestate.click.isClick && !(SCG.defenderMenu.shouldRenderMenu && SCG.defenderMenu.menu.mouseOver)){
		this.createMenuItems();
		SCG.defenderMenu.shouldRenderMenu = true;
		SCG.defenderMenu.clicked =true;
	}

	for(var i = 0; i< this.defenderSoldiers.length; i++)
	{
		this.defenderSoldiers[i].update(now);
	}

	//doWorkByTimer(this.fireTimer, now);
}