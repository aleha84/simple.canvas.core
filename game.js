var SCG = {test: 'test'};

SCG.AI = {};

SCG.space = undefined;

SCG.viewfield = {
	default: {
		width: 500,
		height: 300
	},
	width: 500,
	height: 300,
	current: undefined
};

SCG.canvas = undefined;
SCG.canvasId = "mainCanvas";

SCG.canvasBg = undefined;
SCG.canvasBgId = "backgroundCanvas";

SCG.canvasUI = undefined;
SCG.canvasUIId = "uiCanvas";

SCG.context = undefined;
SCG.contextBg = undefined;
SCG.contextUI = undefined;

SCG.gameLogics = {
	isPaused: false,
	isPausedStep: false,
	gameOver: false,
	wrongDeviceOrientation: false,
	messageToShow: '',
	isMobile: false,
	pausedFrom : undefined,
	pauseDelta : 0,
	doPauseWork: function(now){
		if(this.isPaused && this.pausedFrom == undefined){
			this.pausedFrom = now;
			this.pauseDelta = 0;
		}
		else if(this.pausedFrom != undefined && !this.isPaused){
			this.pauseDelta = now - this.pausedFrom;
			this.pausedFrom = undefined;
		}
		else if(this.pauseDelta != 0){
			this.pauseDelta = 0;
		}
	},
	pauseToggle: function(){
		SCG.gameLogics.isPaused = !SCG.gameLogics.isPaused;	
		SCG.UI.invalidate();
		if(SCG.audio){
			SCG.audio.playPause(SCG.gameLogics.isPaused);	
		}
	}
}

SCG.go = [];


SCG.gameControls = {
	scale:
	{
		times: 1
	},
	selectedGOs : [],
	camera: {
		mode: 'free',
		shiftSpeed: 5,
		centeredOn: undefined,
		resetAfterUpdate: false,
		preventModeSwitch: false,
		shifts: {
			left: false,
			right: false,
			up: false,
			down: false
		},
		free: function(){
			if(this.preventModeSwitch) {return;}
			SCG.gameControls.camera.mode = 'free';
			this.centeredOn = undefined;
		},
		center: function(centeredOn){
			if(this.preventModeSwitch) {return;}
			var gc = SCG.gameControls;
			if(centeredOn == undefined && gc.selectedGOs.length == 1){
				centeredOn = gc.selectedGOs[0];
			}
			if(centeredOn){
				gc.camera.mode = 'centered';
				this.centeredOn = centeredOn;
			}
			else{
				this.free();
			}
		},
		reset: function(){
			var sh = this.shifts;
			sh.left = false;
			sh.right = false;
			sh.up = false;
			sh.down = false;
		},
		update: function(now){
			var sh = this.shifts;
			var bfTL = undefined;
			if(this.mode === 'free'){
				var direction = undefined;
				if(sh.left)
				{
					direction = Vector2.left();
				}
				if(sh.right)
				{
					direction = Vector2.right();
				}
				if(sh.up)
				{
					if(direction!= undefined)
					{
						direction.add(Vector2.up());
					}
					else
					{
						direction = Vector2.up();	
					}
				}
				if(sh.down)
				{
					if(direction!= undefined)
					{
						direction.add(Vector2.down());
					}
					else
					{
						direction = Vector2.down();	
					}
				}
				if(direction!== undefined){
					var delta = direction.mul(this.shiftSpeed);
					bfTL = SCG.viewfield.current.topLeft.add(delta);
				}
			}
			else if(this.mode === 'centered' && this.centeredOn!== undefined){
				bfTL = this.centeredOn.position.substract(new Vector2(SCG.viewfield.default.width/2,SCG.viewfield.default.height/2));
			}

			if(this.resetAfterUpdate){
				this.reset();
			}

			if(bfTL != undefined){
				if(bfTL.x < 0)
				{
					bfTL.x = 0;
				}
				if(bfTL.y < 0)
				{
					bfTL.y = 0;
				}
				if(bfTL.x+SCG.viewfield.current.width > SCG.space.width)
				{
					bfTL.x = SCG.space.width-SCG.viewfield.current.width;
				}
				if(bfTL.y+SCG.viewfield.current.height > SCG.space.height)
				{
					bfTL.y = SCG.space.height-SCG.viewfield.current.height;
				}
				
				SCG.viewfield.current.update(bfTL);
			}
			
		}
	},
	mousestate : {
		position: new Vector2,
		delta: new Vector2,
		leftButtonDown: false,
		rightButtonDown: false,
		middleButtonDown: false,
		timer : undefined,
		reset: function(){
			this.leftButtonDown = false;
            this.rightButtonDown = false;
            this.middleButtonDown = false;
		},
		stopped : function(){
			SCG.gameControls.mousestate.delta = new Vector2;
		},
		toString: function(){
			return 'position: '+this.position.toString()+'<br/>leftButtonDown: ' + this.leftButtonDown;
		},
		doClickCheck: function() {
			var gc = SCG.gameControls;
			for(var i = 0; i < this.eventHandlers.click.length;i++){
				var ch = this.eventHandlers.click[i];
				if(ch.renderBox!=undefined 
					&& ch.renderBox.isPointInside(gc.mousestate.position) 
					&& ch.handlers != undefined 
					&& ch.handlers.click != undefined 
					&& isFunction(ch.handlers.click))
				{
					//to do add and check z-index
					var clickResult = ch.handlers.click.call(ch);
					if(clickResult && clickResult.preventBubbling){
						return;
					}
					break;
				}
			}

			var asg = SCG.scenes.activeScene.game;
			if(asg.clickHandler != undefined && isFunction(asg.clickHandler))
			{
				asg.clickHandler(gc.mousestate.position.division(gc.scale.times));
			}
		},
		eventHandlers: {
			click: []
		}
	},
	keyboardstate: {
		altPressed : false,
		shiftPressed : false,
		ctrlPressed: false
	},

	mouseDown: function(event){
		var ms = SCG.gameControls.mousestate;
		if(event.type == 'touchstart')
		{
			if(event.originalEvent.changedTouches != undefined && event.originalEvent.changedTouches.length == 1)
			{
				ms.leftButtonDown = true;
			}
		}
		else{
			switch (event.which) {
		        case 1:
		            ms.leftButtonDown = true;
		            break;
		        case 2:
		            ms.middleButtonDown = true;
		            break;
		        case 3:
		            ms.rightButtonDown = true;
		            break;
		        default:
		            ms.reset();
		            break;
	    	}
		}
		
	},
	mouseOut: function(event){
		SCG.gameControls.mousestate.reset();
	},
	mouseUp: function(event){
		var that = this;
		var ms = SCG.gameControls.mousestate;
		that.getEventAbsolutePosition(event);

		if(event.type == 'touchstart')
		{
			if(event.originalEvent.changedTouches != undefined && event.originalEvent.changedTouches.length == 1)
			{
				ms.leftButtonDown = false;
			}
		}
		else{
			switch (event.which) {
		        case 1:
		            ms.leftButtonDown = false;
		            break;
		        case 2:
		            ms.middleButtonDown = false;
		            break;
		        case 3:
		            ms.rightButtonDown = false;
		            break;
		        default:
		            ms.reset();
		            break;
		    }
		}

		that.mousestate.doClickCheck();

		event.preventDefault();
	},
	mouseMove: function(event){
		var that = this;
		var ms = SCG.gameControls.mousestate;
		var oldPosition = ms.position.clone();
		that.getEventAbsolutePosition(event);
		ms.delta = ms.position.substract(oldPosition);

		if(SCG.debugger){
			SCG.debugger.setValue(ms.toString());
		}
		//console.log(SCG.gameControls.mousestate.position);
	},
	getEventAbsolutePosition: function(event){
		var eventPos = pointerEventToXY(event);
		SCG.gameControls.mousestate.position = new Vector2(eventPos.x - SCG.canvasUI.margins.left,eventPos.y - SCG.canvasUI.margins.top);
	},
	orientationChangeEventInit: function() {
		var that = this;

		SCG.gameControls.permanentEventInit();

		addListenerMulti(window, 'orientationchange resize', function(e){
			that.graphInit();
		});

		SCG.gameLogics.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		if(SCG.gameLogics.isMobile)
		{
			setTimeout( function(){ window.scrollTo(0, 1); }, 100 );

			addListenerMulti(document, 'fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function(e){
				that.graphInit();
			});
		}
		

		this.graphInit();
	},
	graphInit: function(){
		var gl = SCG.gameLogics;
		gl.messageToShow = '';
		gl.wrongDeviceOrientation = !window.matchMedia("(orientation: landscape)").matches;
		if(gl.wrongDeviceOrientation) {
			gl.messageToShow = 'wrong device orientation - portrait';
			return;
		}

		var width =  window.innerWidth;
		if(width < SCG.viewfield.default.width)
		{
			gl.messageToShow = String.format('width lesser than {3} (width: {0}, iH: {1}, iW: {2})',width, window.innerHeight, window.innerWidth, SCG.viewfield.default.width);
			gl.wrongDeviceOrientation = true;
			return;
		}

		var _width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var _height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		var ratioX = _width /SCG.viewfield.default.width;
		var ratioY = _height / SCG.viewfield.default.height;

		SCG.gameControls.scale.times = Math.min(ratioX, ratioY); 

		if(SCG.gameControls.scale.times < 1)
		{
			gl.messageToShow = String.format('window is to small (width: {0}, height: {1})', _width, _height);
			gl.wrongDeviceOrientation = true;
			return;
		}

		SCG.viewfield.width = SCG.viewfield.default.width * SCG.gameControls.scale.times;
		SCG.viewfield.height = SCG.viewfield.default.height * SCG.gameControls.scale.times;

		var mTop = 0;
		var mLeft = 0;
		if(SCG.viewfield.width < _width)
		{
			mLeft = Math.round((_width - SCG.viewfield.width)/2);
		}
		else if(SCG.viewfield.height < _height)
		{
			mTop = Math.round((_height - SCG.viewfield.height)/2);
		}

		this.setCanvasProperties(SCG.canvas, mTop, mLeft);
		this.setCanvasProperties(SCG.canvasBg, mTop, mLeft);
		this.setCanvasProperties(SCG.canvasUI, mTop, mLeft);

		var br = SCG.scenes.activeScene.backgroundRender;
		if(br != undefined && isFunction(br)){
			br();
		}

		SCG.UI.invalidate();
	},
	setCanvasProperties: function(canvas, mTop, mLeft){
		setAttributes(
			canvas, 
			{
				width: SCG.viewfield.width,
				height: SCG.viewfield.height,
				css: {
					width:SCG.viewfield.width+'px',
					height:SCG.viewfield.height+'px',
					'margin-top': mTop+'px',
					'margin-left': mLeft+'px'
				}
			}
		);

		canvas.width = SCG.viewfield.width;
		canvas.height = SCG.viewfield.height;
		canvas.margins = {
			top : mTop,
			left: mLeft
		}
	},
	permanentEventInit : function (){
		var that = this;

		document.addEventListener("keydown", function(e){
			that.permanentKeyDown(e);
		}, false);

		document.addEventListener("keyup", function(e){
			that.permanentKeyUp(e);
		}, false);

		addListenerMulti(SCG.canvasUI, 'mousedown touchstar', function(e){
			absorbTouchEvent(e);
			if(e.type == 'touchstart')
			{
				that.mouseMove(e);
			}
			that.mouseDown(e);
		});

		addListenerMulti(SCG.canvasUI, 'mouseup touchend', function(e){
			absorbTouchEvent(e);
			that.mouseUp(e);
		});

		addListenerMulti(SCG.canvasUI, 'mouseout touchleave', function(e){
			absorbTouchEvent(e);
			that.mouseOut(e);
		});

		addListenerMulti(SCG.canvasUI, 'mousemove touchmove', function(e){
			absorbTouchEvent(e);
			that.mouseMove(e);
		});

		SCG.canvasUI.addEventListener("contextmenu", function(e){
			e.preventDefault();
			return false;
		}, false);

		// SCG.canvasUI.addEventListener("click", function(e){
		// 	absorbTouchEvent(e);
		// 	that.click(e);
		// }, false);
	},
	permanentKeyDown : function (event)
	{
		var ks = this.keyboardstate;
		ks.shiftPressed =event.shiftKey;
		ks.ctrlPressed =event.ctrlKey;
		ks.altPressed =event.altKey;
	},
	permanentKeyUp : function (event)
	{
		var ks = this.keyboardstate;
		ks.shiftPressed =event.shiftKey;
		ks.ctrlPressed =event.ctrlKey;
		ks.altPressed =event.altKey;
		switch(event.which)
		{
			case 32:
				if(event.shiftKey){ 
					SCG.gameLogics.isPausedStep = true;
				}
				else{
					SCG.gameLogics.pauseToggle();
				}
				break;
			default:
				break;
		}
	}
};