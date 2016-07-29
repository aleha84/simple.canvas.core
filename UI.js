SCG.UI = {
	initialized: false,
	invalidate: function(){
		SCG.contextUI.clearRect(0, 0, SCG.viewfield.width, SCG.viewfield.height);

		var as = SCG.scenes.activeScene;
		var i = as.ui.length;
		while (i--) {
			as.ui[i].update();
			as.ui[i].render();
		}
	},
	addDefaultUIButtons: function(){
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

				this.innerCanvasContext.clearRect(0, 0, s.x, s.y);
				drawFigures(
					this.innerCanvasContext,
					!this.isFullscreen
						? [[new Vector2(0,0),new Vector2(s.x*0.75,0),new Vector2(0,s.y*0.75)],[new Vector2(s.x*0.25,s.y),new Vector2(s.x,s.y),new Vector2(s.x,s.y*0.25)]] 
				 	 	: [[new Vector2(0,s.y*0.475),new Vector2(s.x*0.475,0),new Vector2(s.x*0.475,s.y*0.475)],[new Vector2(s.x*0.525,s.y*0.525),new Vector2(s.x,s.y*0.525),new Vector2(s.x*0.525,s.y)]],
				 	this.transparency);
			}
		});

		btnFs.position = new Vector2(SCG.viewfield.width - btnFs.size.x/2, SCG.viewfield.height - btnFs.size.y/2);
		SCG.scenes.activeScene.ui.push(btnFs);

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
				this.innerCanvasContext.clearRect(0, 0, s.x, s.y);
				drawFigures(
					this.innerCanvasContext,
					!SCG.gameLogics.isPaused
						? [[new Vector2(s.x*0.2,0),new Vector2(s.x*0.4,0),new Vector2(s.x*0.4,s.y),new Vector2(s.x*0.2,s.y)],[new Vector2(s.x*0.6,0),new Vector2(s.x*0.8,0),new Vector2(s.x*0.8,s.y),new Vector2(s.x*0.6,s.y)]] 
				 	 	: [[new Vector2(s.x*0.2,0),new Vector2(s.x*0.8,s.y*0.5),new Vector2(s.x*0.2,s.y)]],
				 	this.transparency);
			}
		});

		btnP.position = new Vector2(SCG.viewfield.width - btnFs.size.x - btnP.size.x/2, SCG.viewfield.height - btnP.size.y/2);

		SCG.scenes.activeScene.ui.push(btnP);

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
					this.innerCanvasContext.clearRect(0, 0, s.x, s.y);
					drawFigures(
						this.innerCanvasContext,
						!SCG.audio.mute
							? [[new Vector2(s.x*0.1,s.y*0.3), new Vector2(s.x*0.3,s.y*0.3),new Vector2(s.x*0.5,0),new Vector2(s.x*0.5,s.y), new Vector2(s.x*0.3,s.y*0.7),new Vector2(s.x*0.1,s.y*0.7)], [new Vector2(s.x*0.55,s.y*0.4), new Vector2(s.x*0.65,s.y*0.4), new Vector2(s.x*0.65,s.y*0.6),new Vector2(s.x*0.55,s.y*0.6)],[new Vector2(s.x*0.75,s.y*0.2), new Vector2(s.x*0.85,s.y*0.2), new Vector2(s.x*0.85,s.y*0.8),new Vector2(s.x*0.75,s.y*0.8)]] 
					 	 	: [[new Vector2(s.x*0.1,s.y*0.3), new Vector2(s.x*0.3,s.y*0.3),new Vector2(s.x*0.5,0),new Vector2(s.x*0.5,s.y), new Vector2(s.x*0.3,s.y*0.7),new Vector2(s.x*0.1,s.y*0.7)]],
					 	this.transparency);
				}
			});

			btnM.position = new Vector2(SCG.viewfield.width - btnFs.size.x - btnP.size.x - btnM.size.x/2, SCG.viewfield.height - btnM.size.y/2);

			SCG.scenes.activeScene.ui.push(btnM);
		}
	},
	initialize: function(){
		if(this.initialized){ return; }

		for(var i = 0;i< this.controls.length;i++){
			SCG.GO.register(this.controls[i].type, this.controls[i]);	
		}
	}
};

SCG.UI.controls = [{
	type: 'button',
	size: new Vector2(50,50),
	isCustomRender: true,
	innerCanvas: undefined,
	transparency: 1,
	ui : true,
	initializer: function(that){
		if(that.isCustomRender){
			that.innerCanvas = document.createElement('canvas');
			that.innerCanvas.width = that.size.x;
			that.innerCanvas.height = that.size.y;
			that.innerCanvasContext = that.innerCanvas.getContext('2d');
		}
	},
	customRender: function() {
		SCG.contextUI.drawImage(this.innerCanvas, 
						(this.renderPosition.x - this.renderSize.x/2), 
						(this.renderPosition.y - this.renderSize.y/2), 
						this.renderSize.x, 
						this.renderSize.y);
	},
}]

SCG.UI.initialize();