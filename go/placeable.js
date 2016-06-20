// used for shot interaction

SCG.Placeable = {
	battlefield : {},
	playerUnits: {},
	enemyUnits: {},
	show: false,

	// see and remove commented out because of hi load on mobile devices
	set: function(go){
		// var topLeft = new Vector2(Math.round(go.position.x - go.size.x/2), Math.round(go.position.y - go.size.y/2));
		// for(var x = 0; x<go.size.x;x++){
		// 	for(var y=0;y<go.size.y;y++){
		// 		var index = (topLeft.x+x) + 'x' + (topLeft.y+y); //String.format("{0}_{1}", topLeft.x+x, topLeft.y+y);
		// 		if(this.battlefield[index] == undefined) {
		// 			this.battlefield[index] = {};
		// 		}

		// 		if(this.battlefield[index][go.id] == undefined){
		// 			this.battlefield[index][go.id] = go;
		// 		}
		// 	}
		// }
	},
	remove: function(go){
		// var topLeft = new Vector2(Math.round(go.position.x - go.size.x/2), Math.round(go.position.y - go.size.y/2));
		// var controlSum = go.size.x * go.size.y;
		// var deleteCount = 0;
		// for(var x = 0; x<go.size.x;x++){
		// 	for(var y=0;y<go.size.y;y++){
		// 		var index = (topLeft.x+x) + 'x' + (topLeft.y+y); //String.format("{0}_{1}", topLeft.x+x, topLeft.y+y);
		// 		if(this.battlefield[index]!=undefined && this.battlefield[index][go.id] != undefined){
		// 			delete this.battlefield[index][go.id];
		// 			deleteCount++;
		// 			if(isEmpty(this.battlefield[index])){
		// 				delete this.battlefield[index];
		// 			}
		// 		}
		// 	}
		// }
		// if(deleteCount != controlSum)
		// {
		// 	console.log('removeGlobal called');
		// 	this.removeGlobal(go);
		// }
	},
	removeGlobal: function(go){
		//var topLeft = new Vector2(Math.round(go.position.x - go.size.x/2), Math.round(go.position.y - go.size.y/2));
		for (var key in this.battlefield) {
			if (this.battlefield.hasOwnProperty(key) && this.battlefield[key][go.id] != undefined) {
				delete this.battlefield[key][go.id];
			}
		}
	},
	render: function(){ // very slow.
		for (var index in this.battlefield) {
			if (this.battlefield.hasOwnProperty(index) && !isEmpty(this.battlefield[index])) {
				var position = new Vector2(parseInt(index.split('x')[0]), parseInt(index.split('x')[1])).mul(SCG.gameControls.scale.times);
				SCG.context.beginPath();
				SCG.context.rect(position.x, position.y, SCG.gameControls.scale.times, SCG.gameControls.scale.times);
				SCG.context.lineWidth = 1;
				SCG.context.strokeStyle = 'rgba(0, 0, 255, 0.5)';
				SCG.context.closePath();
				SCG.context.stroke();
			}
		}
	}
}