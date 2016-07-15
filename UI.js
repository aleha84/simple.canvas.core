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
		var btn = SCG.GO.create("button", {
			position: new Vector2(SCG.viewfield.width - 25, SCG.viewfield.height - 25),
			handlers: {
				click: function(){
					screenfull.toggle(document.documentElement);
					return {
						preventBubbling: true
					};
				}
			}
		});

		SCG.scenes.activeScene.ui.push(btn);
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
	initializer: function(that){
		that.innerCanvas = document.createElement('canvas');
		that.innerCanvas.width = that.size.x;
		that.innerCanvas.height = that.size.y;
		that.innerCanvasContext = that.innerCanvas.getContext('2d');

		var ctx = that.innerCanvasContext;
		ctx.beginPath();
		ctx.rect(0, 0, that.size.x, that.size.y);
		ctx.fillStyle = 'red';
		ctx.fill()

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