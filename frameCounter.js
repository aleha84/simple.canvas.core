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
		SCG.context.save();     
		SCG.context.fillStyle = "red";
		SCG.context.font = "48px serif";
  		SCG.context.fillText(this.prevRate, SCG.viewfield.width-60, 40);
  		SCG.context.font = "24px serif";
  		SCG.context.fillText(this.visibleCount, SCG.viewfield.width-60, 80);
  		if(SCG.gameLogics.messageToShow != '')
  		{
  			SCG.context.fillStyle = "black";
			SCG.context.font = "24px serif";
  			SCG.context.fillText(SCG.gameLogics.messageToShow, 10, 40);
  		}
  		SCG.frameCounter.visibleCount = 0;
		SCG.context.restore(); 
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