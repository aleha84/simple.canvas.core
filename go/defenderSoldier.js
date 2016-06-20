SCG.GO.DefenderSoldier = function(prop)
{
	if(prop.position === undefined)
	{
		throw 'SCG.GO.DefenderSoldier -> position is undefined';
	}

	if(prop.size == undefined){ prop.size = new Vector2(10,10); }
	if(prop.maxHealth == undefined){ prop.maxHealth = 50; }
	SCG.GO.GO.call(this,prop);
	this.img = SCG.images.defender_soldier;

	this.id = 'DefenderSoldier' + (SCG.GO.DefenderSoldier.counter++);

	this.target = undefined;
	this.originRange = 75;
	this.range = 75;
	this.side = this.parent.side;

	this.originScatter = 1;
	this.currentScatter = 1;

	this.penetration = 1;
	this.damageModifier = 1;
	this.originDamageModifier = 1;
	this.explosionRadiusModifier = 1;
	this.originExplosionRadiusModifier = 1;
	this.level = 0;
	this.prevLevelExpNeed = 0;
	this.nextLevelExpNeed= 100;
	this.nextLevelExpStep = 100;
	this.currentExperience = 0;
	this.weaponImg = undefined;

	this.scatterLevel = 0;
	this.fireDelayLevel = 0;
	this.rangeLevel = 0;
	this.explosionRadiusLevel = 0;
	

	this.fireTimer = {
		lastTimeWork: new Date,
		delta : 0,
		currentDelay: 0,
		originDelay: 0,
		doWorkInternal : this.fire,
		context: this
	}

	this.aimingTimer = {
		lastTimeWork: new Date,
		delta : 0,
		currentDelay: 0,
		originDelay: 500,
		doWorkInternal : this.aiming,
		context: this	
	}

	switch(this.type){
		case 'machine-gunner':
			this.originScatter = 25;
			this.originFireDelay = 50;
			this.originRange = 90;
			this.weaponImg = SCG.images.machine_gun;
			this.burstSize = 15;
			this.originBurstSize = 15;
			this.maxBurstSize = 15;
			this.reloading = false;
			this.reloadingLevel = 0;
			this.burstLevel = 0;
			this.aimingTimer.originDelay = 250;
			this.reloadingTimer = {
				lastTimeWork: new Date,
				delta : 0,
				currentDelay: 5000,
				originDelay: 5000,
				doWorkInternal : this.reload,
				context: this
			}
			break
		case 'gunner':
			this.originScatter = 7;
			this.originFireDelay = 700;
			this.originRange = 65;
			this.weaponImg = SCG.images.rifle;
			break;
		case 'sniper':
			this.originScatter = 3;
			this.originFireDelay = 4000;
			this.originRange = 125;
			this.weaponImg = SCG.images.sniper;
			break;
		case 'rpg':
			this.originScatter = 15;
			this.originFireDelay = 7000;
			this.originRange = 110;
			this.weaponImg = SCG.images.rpg;
			break;
		default:
			break;
	}

	this.range = this.originRange;
	this.currentScatter = this.originScatter;
	this.fireTimer.originDelay = this.originFireDelay;
}

SCG.GO.DefenderSoldier.counter = 0;
SCG.GO.DefenderSoldier.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.DefenderSoldier.prototype.constructor = SCG.GO.DefenderSoldier;

SCG.GO.DefenderSoldier.prototype.getExperience = function(experience){
	this.currentExperience += experience;
	if(this.currentExperience >= this.nextLevelExpNeed){
		this.levelUp();
	}
}

SCG.GO.DefenderSoldier.prototype.reload = function(){
	this.reloading = false;
	this.burstSize = this.maxBurstSize;
}

SCG.GO.DefenderSoldier.prototype.levelUp = function(){
	SCG.GO.Remains.types.getObject('levelUp', this.position.add(new Vector2(0, -this.size.y/2), true), false);

	this.level++;
	this.currentExperience -= this.nextLevelExpNeed;
	this.prevLevelExpNeed = this.nextLevelExpNeed;
	this.nextLevelExpNeed = this.prevLevelExpNeed + this.level*this.nextLevelExpStep;

	this.maxHealth += (25 * this.level);
	this.health = this.maxHealth;

	switch(this.type){
		case 'machine-gunner':
			this.damageModifier = this.originDamageModifier  + (0.25 * this.level);
			switch(getRandomInt(1,3)){
				case 1:
					this.reloadingLevel++;
					this.reloadingTimer.originDelay = this.reloadingTimer.originDelay * 0.93;
					break;
				case 2:
					this.burstLevel++;
					this.maxBurstSize = this.originBurstSize + (this.burstLevel * 5);
					break;
				case 3:
					this.rangeLevel++;
					this.range = this.originRange  + (10 * this.rangeLevel);
					break;
				default:
					break;
			}
			break;
		case 'gunner':
			this.damageModifier = this.originDamageModifier  + (0.25 * this.level);
			if(this.level == 7){
				this.useGrenadeLauncher = true;
			}
			switch(getRandomInt(1,3)){
				case 1:
					this.scatterLevel++;
					this.currentScatter = this.originScatter * (Math.pow(0.91, this.fireDelayLevel));
					break;
				case 2:
					this.fireDelayLevel++;
					this.fireTimer.originDelay = this.originFireDelay * (Math.pow(0.9, this.level));
					break;
				case 3:
					this.rangeLevel++;
					this.range = this.originRange  + (7.5 * this.rangeLevel);
					break;
				default:
					break;
			}
			break;
		case 'sniper':
			switch (getRandomInt(1,3)){
				case 1:
					this.fireDelayLevel++;
					this.fireTimer.originDelay = this.originFireDelay * (Math.pow(0.9, this.fireDelayLevel));
					break;
				case 2:
					this.rangeLevel++;
					this.range = this.originRange  + (25 * this.rangeLevel);
					break;
				case 3: 
					this.penetration++;
					break;
			}
			break;
		case 'rpg':
			switch (getRandomInt(1,3)){
				case 1:
					this.fireDelayLevel++;
					this.fireTimer.originDelay = this.originFireDelay * (Math.pow(0.9, this.fireDelayLevel));
					break;
				case 2:
					this.rangeLevel++;
					this.range = this.originRange  + (10 * this.rangeLevel);
					break;
				case 3:
					this.explosionRadiusLevel++;
					this.explosionRadiusModifier = this.originExplosionRadiusModifier  + (0.2 * this.explosionRadiusLevel);
					break;
			}
		default:
			break;
	}
}

SCG.GO.DefenderSoldier.prototype.aiming = function(){
	var units = this.side == 1 ? SCG.Placeable.enemyUnits : SCG.Placeable.playerUnits;
	var unitsInRange = [];
	var specificTargets = [];
	var directions = [];
	var vUp = Vector2.up();
	for(var unitId in units) {
		if(units.hasOwnProperty(unitId)){
			var unit = units[unitId];
			var distance = this.position.distance(unit.position);
			if(distance <= this.range){
				if(this.type=='machine-gunner'){
					var d = this.position.direction(unit.position);
					//var angle = vUp.angleTo(this.position.direction(unit.position));
					//this.fireDirection = this.position.direction(unit.position);
					//return;
					directions.push({direction: d, angle: vUp.angleTo(d)});
				}
				else{
					if(this.type=='sniper' && unit instanceof SCG.GO.EnemyLarge){
						specificTargets.push({distance: distance, unit: unit});
					}
					if(this.type=='rpg' && unit instanceof SCG.GO.EnemyVehicle){
						specificTargets.push({distance: distance, unit: unit});
					}
					unitsInRange.push({distance: distance, unit: unit});		
				}
			}
		}
	}

	if(this.type=='machine-gunner'){
		this.fireDirection = undefined;
		if(directions.length > 0){
			if(directions.length == 1){
				this.fireDirection = directions[0].direction.clone();
			}
			else{
				var sides = {left : { top: [], bottom: []}, right : { top: [], bottom: []}};
				var side = undefined;
				for(var i = 0; i<directions.length;i++){
					side = sides[directions[i].angle < 0 ? 'left' : 'right'];
					var angle = Math.abs(directions[i].angle);
					side[angle < 90 ? 'top' : 'bottom'].push(directions[i].direction);
				}

				side = sides[(sides.left.top.length + sides.left.bottom.length) >= (sides.right.top.length + sides.right.bottom.length) ? 'left' : 'right'];
				quater = side[side.top.length >= side.bottom.length ? 'top' : 'bottom'];
				if(quater.length == 1){
					this.fireDirection = quater[0].clone();
				}
				else{
					this.fireDirection = Vector2.average(quater);
				}
			}
		}
		return;
	}

	if(specificTargets.length > 0){
		unitsInRange = specificTargets;
	}

	if(unitsInRange.length > 0){
		if(unitsInRange.length == 1){
			this.target = unitsInRange[0].unit;
		}
		else{
			for(var i = 0; i< this.parent.defenderSoldiers.length; i++)
			{
				if(unitsInRange.length == 1){
					break;
				}
				var ds = this.parent.defenderSoldiers[i];
				if(ds == this){
					continue;
				}

				if(ds.target != undefined){
					var j = unitsInRange.length;
					while(j--){
						if(unitsInRange[j].unit == ds.target){
							var deleted = unitsInRange.splice(j,1);
						}
					}
				}
			}

			//find closest
			var j = unitsInRange.length;
			var closest = unitsInRange[0];
			while(j--){
				if(unitsInRange[j].distance < closest.distance){
					closest = unitsInRange[j];
				}
			}

			this.target = closest.unit;
		}
	}
}

SCG.GO.DefenderSoldier.prototype.fire = function(){
	if((this.type != 'machine-gunner' && this.target == undefined) || (this.type == 'machine-gunner' && (this.fireDirection == undefined || this.burstSize == 0))){
		return;
	}

	var targetNextPosition = undefined;
	if(this.type == 'machine-gunner'){

		targetNextPosition = this.position.add(this.fireDirection.mul(this.range), true);
		
		this.burstSize--;
		if(this.burstSize == 0){
			this.reloading = true;
		}
	}
	else{
		targetNextPosition = this.target.position
			.add(this.target.direction.mul(this.target.speed* ((this.position.distance(this.target.position)) / SCG.GO.Shot.ShotTypes[this.type].speed) ),true);
	}
	
	targetNextPosition = targetNextPosition.add(new Vector2(getRandom(-this.originScatter, this.originScatter), getRandom(-this.originScatter, this.originScatter)),true);

	if(this.type == 'sniper'){
		targetNextPosition = this.position.add(this.position.direction(targetNextPosition).mul(this.range), true);
	}

	if(this.type == 'gunner' && this.useGrenadeLauncher){
		if(this.shotCounter == undefined){this.shotCounter = 0;}
		if(this.shotCounter == 4){
			SCG.GO.Shot.ShotTypes.getGrenade(this, targetNextPosition.clone());	
			this.shotCounter = 0;
		}

		this.shotCounter++;
	}
	
	SCG.GO.Shot.ShotTypes.getShot(this, targetNextPosition.clone());
}

SCG.GO.DefenderSoldier.prototype.internalRender = function(){
	
	if(this.weaponImg != undefined){
		SCG.context.drawImage(this.weaponImg, 
				(this.renderPosition.x - this.renderSize.x * (1/6) ), 
				(this.renderPosition.y - this.renderSize.y * (1/6)), 
				this.renderSize.x* 2/3, 
				this.renderSize.y* 2/3);	
	}
}

SCG.GO.DefenderSoldier.prototype.internalUpdate = function(now){
	if(this.target != undefined && (!this.target.alive || this.position.distance(this.target.position) > this.range)){
		this.target = undefined;
	}

	if(this.type=='machine-gunner'){
		doWorkByTimer(this.aimingTimer, now);

		if(this.reloading){
			doWorkByTimer(this.reloadingTimer, now);
		}
		else{
			doWorkByTimer(this.fireTimer, now);
		}
	}
	else {
		if(this.target == undefined){
			doWorkByTimer(this.aimingTimer, now);
		}
		else{
			doWorkByTimer(this.fireTimer, now); 	
		}	
	}
}