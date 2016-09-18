SCG.UI = {
	initialized: false,
	invalidate: function(){
		if(!SCG.contextUI){
			return;
		}
		SCG.contextUI.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);

		var as = SCG.scenes.activeScene;
		var i = as.ui.length;
		while (i--) {
			as.ui[i].update();
			as.ui[i].render();
		}
	},
	addDefaultUIButtons: function(){
		var as = SCG.scenes.activeScene;
		var vd = SCG.viewfield.default;
		var btnFs = SCG.GO.create("button", {
			position: new Vector2,
			isFullscreen: false,
			transparency: 0.75,
			handlers: {
				click: function(){
					this.isFullscreen = !this.isFullscreen;
					screenfull.toggle(document.documentElement);
					return {
						preventBubbling: true
					};
				}
			},
			internalUpdate: function(){
				var s = this.size;
				var icc = this.innerCanvasContext;
				icc.clearRect(0, 0, s.x, s.y);
				drawFigures(
					icc,
					!this.isFullscreen
						? [[new Vector2(0,0),new Vector2(s.x*0.75,0),new Vector2(0,s.y*0.75)],[new Vector2(s.x*0.25,s.y),new Vector2(s.x,s.y),new Vector2(s.x,s.y*0.25)]] 
				 	 	: [[new Vector2(0,s.y*0.475),new Vector2(s.x*0.475,0),new Vector2(s.x*0.475,s.y*0.475)],[new Vector2(s.x*0.525,s.y*0.525),new Vector2(s.x,s.y*0.525),new Vector2(s.x*0.525,s.y)]],
				 	{alpha: this.transparency, fill: 'darkgrey'});
			}
		});

		btnFs.position = new Vector2(vd.width - btnFs.size.x/2, vd.height - btnFs.size.y/2);
		as.ui.push(btnFs);

		var btnP = SCG.GO.create("button", {
			position: new Vector2,
			transparency: 0.75,
			handlers: {
				click: function(){
					SCG.gameLogics.pauseToggle();
					return {
						preventBubbling: true
					};
				}
			},
			internalUpdate: function(){
				var s = this.size;
				var icc = this.innerCanvasContext;
				icc.clearRect(0, 0, s.x, s.y);
				drawFigures(
					icc,
					!SCG.gameLogics.isPaused
						? [[new Vector2(s.x*0.2,0),new Vector2(s.x*0.4,0),new Vector2(s.x*0.4,s.y),new Vector2(s.x*0.2,s.y)],[new Vector2(s.x*0.6,0),new Vector2(s.x*0.8,0),new Vector2(s.x*0.8,s.y),new Vector2(s.x*0.6,s.y)]] 
				 	 	: [[new Vector2(s.x*0.2,0),new Vector2(s.x*0.8,s.y*0.5),new Vector2(s.x*0.2,s.y)]],
				 	{alpha: this.transparency, fill: 'darkgrey'});
			}
		});

		btnP.position = new Vector2(vd.width - btnFs.size.x - btnP.size.x/2, vd.height - btnP.size.y/2);

		as.ui.push(btnP);

		if(SCG.audio){
			var btnM = SCG.GO.create("button", {
				position: new Vector2,
				transparency: 0.75,
				handlers: {
					click: function(){
						SCG.audio.muteToggle();
						SCG.UI.invalidate();
						return {
							preventBubbling: true
						};
					}
				},
				internalUpdate: function(){
					var s = this.size;
					var icc = this.innerCanvasContext;
					icc.clearRect(0, 0, s.x, s.y);
					drawFigures(
						icc,
						!SCG.audio.mute
							? [[new Vector2(s.x*0.1,s.y*0.3), new Vector2(s.x*0.3,s.y*0.3),new Vector2(s.x*0.5,0),new Vector2(s.x*0.5,s.y), new Vector2(s.x*0.3,s.y*0.7),new Vector2(s.x*0.1,s.y*0.7)], [new Vector2(s.x*0.55,s.y*0.4), new Vector2(s.x*0.65,s.y*0.4), new Vector2(s.x*0.65,s.y*0.6),new Vector2(s.x*0.55,s.y*0.6)],[new Vector2(s.x*0.75,s.y*0.2), new Vector2(s.x*0.85,s.y*0.2), new Vector2(s.x*0.85,s.y*0.8),new Vector2(s.x*0.75,s.y*0.8)]] 
					 	 	: [[new Vector2(s.x*0.1,s.y*0.3), new Vector2(s.x*0.3,s.y*0.3),new Vector2(s.x*0.5,0),new Vector2(s.x*0.5,s.y), new Vector2(s.x*0.3,s.y*0.7),new Vector2(s.x*0.1,s.y*0.7)]],
					 	{alpha: this.transparency, fill: 'darkgrey'});
				}
			});

			btnM.position = new Vector2(vd.width - btnFs.size.x - btnP.size.x - btnM.size.x/2, vd.height - btnM.size.y/2);

			as.ui.push(btnM);
		}
	},
	initialize: function(){
		if(this.initialized){ return; }

		for(var i = 0;i< this.controls.length;i++){
			SCG.GO.register(this.controls[i].type, this.controls[i]);	
		}
	},
	helpers: {
		createCanvas: function(ui){
			ui.innerCanvas = document.createElement('canvas');
			var canvas = ui.innerCanvas;
			canvas.width = ui.size.x;
			canvas.height = ui.size.y;
			ui.innerCanvasContext = canvas.getContext('2d');

			ui.img = ui.innerCanvas;
		}
	}
};

SCG.UI.controls = [{
	type: 'button',
	size: new Vector2(50,50),
	contextName: 'contextUI',
	innerCanvas: undefined,
	transparency: 1,
	static : true,
	text: undefined,
	useInnerCanvas: true,
	border: false,
	initializer: function(that){
		if(!this.useInnerCanvas){
			return;
		}

		SCG.UI.helpers.createCanvas(that);
		var context = that.innerCanvasContext;
		var text = this.text;

		if(text != undefined){
			var textWidth = 0;
			if(text.autoSize){
				var fontsize=300;

				// lower the font size until the text fits the canvas
				do{
					fontsize--;
					context.font=fontsize+"px "+text.font;
					textWidth = context.measureText(text.value).width;
				}while(textWidth>this.size.x*0.8)
			}
			else{
				context.font = text.font;
				textWidth = context.measureText(text.value).width;
			}

			if(text.color){
				context.fillStyle = text.color;
			}

			context.fillText(text.value, (this.size.x/2) - (textWidth / 2),(this.size.y/2)+fontsize/2);
			context.rect(1,1,this.size.x-1,this.size.y-1);
			context.stroke();
		}

		
	},
	internalRender: function(){
		if(this.border){
			var rp = this.renderPosition;
			var rs = this.renderSize;
			this.context.rect(rp.x - rs.x/2,rp.y-rs.y/2,rs.x,rs.y);
			this.context.stroke();	
		}
	}
},
{
	type:'label',
	size: new V2(50,10),
	innerCanvas: undefined,
	contextName: 'contextUI',
	static : true,
	text: {
		value: 'sample',
		format: undefined,
		font: 'px Arial',
		size: 20,
		color: 'black',
		border: false,
		align: 'center'
	},
	initializer: function(that){
		SCG.UI.helpers.createCanvas(that);
	},
	internalUpdate: function(now){
		var icc = this.innerCanvasContext;
		var s = this.size;
		var text = this.text;
		icc.clearRect(0, 0, s.x, s.y);
		icc.font = text.size + text.font;
		icc.fillStyle = text.color;
		var resultValue = text.value;
		if(text.format){
			resultValue = String.format(text.format, text.value);
		}
		icc.textAlign = text.align;
		icc.textBaseline = 'middle';

		icc.fillText(resultValue, this.size.x/2,this.size.y/2);
		if(text.border){
			icc.rect(1,1,this.size.x-1,this.size.y-1);
			icc.stroke();	
		}
	}
},
{
	type: 'image',
	contextName: 'contextUI',
	size: new V2(50,50),
	static: true,
}]

SCG.UI.initialize();