SCG.GO.Shot = function(prop)
{
	if(prop.side === undefined) {
		throw 'SCG2.GO.Shot -> side is undefined';	
	}
	if(prop.position === undefined)
	{
		throw 'SCG2.GO.Shot -> position is undefined';
	}
	if(prop.destination === undefined) {
		throw 'SCG2.GO.Shot -> destination is undefined';	
	}
	if(prop.damage == undefined){ prop.damage = 1; }
	if(prop.penetration  === undefined) { this.penetration  = 1;}
	if(prop.explosionRadius  === undefined) { this.explosionRadius  = 1;}
	if(prop.isExplosive  === undefined) { this.isExplosive  = false;}
	if(prop.size == undefined){ prop.size = new Vector2(1,1); }
	if(prop.speed == undefined){ prop.speed = 10; }
	if(prop.strokeColor === undefined) { this.strokeColor = '#ff0000';}
	if(prop.lineWidth  === undefined) { this.lineWidth  = 2;}
	SCG.GO.GO.call(this,prop);

	//overriding defaults and props
	this.id = 'Shot' + (SCG.GO.Shot.counter++);
	this.setDeadOnDestinationComplete = true;
	this.setDestination(this.destination);
}

SCG.GO.Shot.counter = 0;
SCG.GO.Shot.prototype = Object.create( SCG.GO.GO.prototype );
SCG.GO.Shot.prototype.constructor = SCG.GO.Shot;

SCG.GO.Shot.ShotTypes = {
	gunner: {
		damage: 1,
		speed: 5,
		explosionType: 'tinyExplosion'
	},
	'machine-gunner' : {
		damage: 3,
		speed: 8,
		explosionType: 'tinyExplosion'	
	},
	sniper: {
		damage: 50,
		speed: 15,
		explosionType: 'tinyExplosion'
	},
	grenade: {
		damage: 30,
		speed: 10,
		explosionRadius: 10,
		explosionType: 'smallExplosion',
		isExplosive : true
	},
	rpg:{
		damage: 100,
		speed: 10,
		explosionRadius: 20,
		explosionType: 'mediumExplosion',	
		isExplosive : true
	},
	bomb: {
		damage: 300,
		speed: 0.1,
		explosionRadius: 75,
		explosionType: 'bigExplosion',
		isExplosive : true
	},
	getGrenade: function(owner, destination){
		SCG.go.push(new SCG.GO.Shot($.extend({},{
			owner: owner,
			side: owner.side,
			position: owner.position.clone(),
			destination: destination,
			damageModifier: 1,
			penetration: 1, 
			explosionRadiusModifier: 1
		}, SCG.GO.Shot.ShotTypes['grenade'])));
	},
	getShot: function(owner, destination){
		SCG.go.push(new SCG.GO.Shot($.extend({},{
			owner: owner,
			side: owner.side,
			position: owner.position.clone(),
			destination: destination,
			damageModifier: owner.damageModifier,
			penetration: owner.penetration, 
			explosionRadiusModifier: owner.explosionRadiusModifier
		}, SCG.GO.Shot.ShotTypes[owner.type])));
	},
	getBomb: function(destination){
		SCG.go.push(new SCG.GO.Shot($.extend({},{
			side: 1,
			position: destination.clone(),
			destination: destination.add(new Vector2(0.1,0.1),true),
			damageModifier: 1,
			penetration: 1, 
			explosionRadiusModifier: 1
		}, SCG.GO.Shot.ShotTypes['bomb'])));
	}
}

SCG.GO.Shot.prototype.internalRender = function(){
	SCG.context.beginPath();
	SCG.context.lineWidth = this.lineWidth;
	SCG.context.strokeStyle = this.strokeColor;
	SCG.context.moveTo(this.renderPosition.x, this.renderPosition.y);
	var lineTo = this.renderPosition.add(this.direction.mul(this.speed*SCG.gameControls.scale.times),true);
	SCG.context.lineTo(lineTo.x, lineTo.y);
	SCG.context.stroke();
}

SCG.GO.Shot.prototype.explosion = function(position){
	var units = this.side == 1 ? SCG.Placeable.enemyUnits : SCG.Placeable.playerUnits;
	var damage = 0;
	var explosionRadius = this.explosionRadius * this.explosionRadiusModifier;
	for(var unitId in units) {
		if(units.hasOwnProperty(unitId)){
			var unit = units[unitId];
			var distance = position.distance(unit.position);
			if(distance <= explosionRadius){
				if(distance <= explosionRadius / 2){
					damage = this.damage * this.damageModifier;
				}
				else if(distance > explosionRadius / 2 &&  distance <= explosionRadius * 3/4 ){
					damage = this.damage * this.damageModifier / 2;
				}
				else {
					damage = this.damage * this.damageModifier / 4;	
				}

				this.hit(unit, damage);
			}
		}
	}
}

SCG.GO.Shot.prototype.hit = function(unit, damage) {
	if(unit.armoured && !this.isExplosive){
		damage*=0.1;
	}

	unit.hitted(damage);
	if(!unit.alive){
		if(unit.experienceCost != undefined && this.owner != undefined && this.owner.alive && this.owner.getExperience != undefined){
			this.owner.getExperience(unit.experienceCost);	
		}
		
		if(unit.moneyCost != undefined){
			SCG.difficulty.money += unit.moneyCost;
		}
	}
}

SCG.GO.Shot.prototype.beforeDead = function(){
	if(this.isExplosive){
		this.explosion(this.hitPoint != undefined ? this.hitPoint : this.position);
	}
}

SCG.GO.Shot.prototype.internalPreUpdate = function(){
	if(!this.alive || this.type == 'bomb'){
		return false;
	}

	var units = this.side == 1 ? SCG.Placeable.enemyUnits : SCG.Placeable.playerUnits;
	var segment = { begin: this.position.clone(), end: this.position.add(this.direction.mul(this.speed), true), lenght: this.speed};
	for(var unitId in units) {
		if(units.hasOwnProperty(unitId)){
			var unit = units[unitId];
			
			if(this.position.distance(unit.position) < (this.speed*3) 
				&& segmentIntersectBox(segment , unit.box))
			{
				var hitPoint = segment.begin;
				for(var ic = 5;ic>0; ic--){
					if(unit.box.isPointInside(segment.begin)){
						hitPoint = segment.begin;
						break;
					}
					else if(unit.box.isPointInside(segment.end)){
						hitPoint = segment.end;
						break;
					}
					else{
						var nLength = segment.lenght/2;
						var middle = segment.begin.add(this.direction.mul(nLength),true);
						segment = segment.begin.distance(unit.position) <= segment.end.distance(unit.position) 
							?  { begin : segment.begin, end : middle, lenght : nLength } 
							: { begin : middle, end : segment.end, lenght : nLength };
						hitPoint = segment.begin;
					}
				}
				this.hitPoint = hitPoint;
				
				if(this.isExplosive){
					this.setDead();	
					break;
				}

				this.hit(unit, this.damage * this.damageModifier);

				this.penetration--;
				if(this.penetration <= 0){
					this.setDead();	
				}
				else{
					this.damage /= 2;
				}
				
				break;
			}
		}
	}

	// for(var i = 0;i < this.speed; i++){
	// 	var step = this.position.add(this.direction.mul(i), true);
	// 	var index = Math.round(step.x) + 'x' + Math.round(step.y);
	// 	if(SCG.Placeable.battlefield[index] != undefined){
	// 		var hitted = false;
	// 		for (var unitId in SCG.Placeable.battlefield[index]) {	
	// 			if (SCG.Placeable.battlefield[index].hasOwnProperty(unitId)) {
	// 				var unit = SCG.Placeable.battlefield[index][unitId];
	// 				if(unit.side != this.side){
	// 					unit.hitted();
	// 					hitted = true;
	// 				}
	// 			}
	// 		}
	// 		if(hitted){
	// 			this.setDead();
	// 			SCG.Animations.createObject(SCG.Animations.types.smallExplosion, step.clone());
	// 			break;
	// 		}
	// 	}
	// }
}