SCG.frameCounter = {
	lastTimeCheck : new Date,
	checkDelta: 1000,
	prevRate: 0,
	current: 0,
	renderConsumption:
	{
		begin: new Date,
		end: new Date,
	},
	visibleCount: 0,
	draw: function(){
		var ctx = SCG.context;
		ctx.save();     
		ctx.fillStyle = "red";
		ctx.font = "48px serif";
  		ctx.fillText(this.prevRate, SCG.viewfield.width-60, 40);
  		ctx.font = "24px serif";
  		ctx.fillText(this.visibleCount, SCG.viewfield.width-60, 80);
  		if(SCG.gameLogics.messageToShow != '')
  		{
  			ctx.fillStyle = "black";
			ctx.font = "24px serif";
  			ctx.fillText(SCG.gameLogics.messageToShow, 10, 40);
  		}
  		SCG.frameCounter.visibleCount = 0;
		ctx.restore(); 
	},
	doWork : function(now)
	{
		if(now - this.lastTimeCheck > this.checkDelta)
		{
			this.prevRate = this.current;
			this.current = 0;
			this.lastTimeCheck = now;
		}
		else{
			this.current++;
		}

		this.draw();
	}
}