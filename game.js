var SCG = {};

SCG.battlefield = {
	default: {
		width: 500,
		height: 300
	},
	width: 500,
	height: 300,
};

SCG.canvas = undefined;
SCG.canvasId = "mainCanvas";
SCG.canvasIdSelector = "#"+SCG.canvasId;
SCG.context = undefined;
SCG.gameLogics = {
	isPaused: false,
	isPausedStep: false,
	gameOver: false,
	drawBoundings: true,
	fillBoundings: false,
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
	}
}





SCG.go = [];

SCG.debugger = 
{
	el: $('.debugger'),
	initialized : false,
	init: function() { 
		this.el = $('.debugger'),
		this.initialized = true;
	},
	clear : function() { this.setValue('') },
	setValue : function(value) { 
		if(!this.initialized)
		{
			this.init();	
		}
		this.el.html(value); 
	}
}

SCG.gameControls = {
	scale:
	{
		times: 1
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
			if(this.leftButtonDown)
			{
				this.click.prevStateDown = true;
			}
			else if(!this.leftButtonDown && this.click.prevStateDown)
			{
				this.click.prevStateDown = false;
				this.click.isClick = true;

				if(!isEmpty(this.click.handlers)){
					for(var handlerId in this.click.handlers) {
						if(this.click.handlers.hasOwnProperty(handlerId) && typeof this.click.handlers[handlerId] === 'function'){
							this.click.handlers[handlerId]();
						}
					}
				}
			}
			else if(this.click.isClick)
			{
				this.click.isClick = false;
			}
		},
		click: {
			prevStateDown: false,
			isClick : false,
			handlers: {}
		}
	},
	keyboardstate: {
		altPressed : false,
		shiftPressed : false,
		ctrlPressed: false
	},

	mouseDown: function(event){
		if(event.type == 'touchstart')
		{
			if(event.originalEvent.changedTouches != undefined && event.originalEvent.changedTouches.length == 1)
			{
				SCG.gameControls.mousestate.leftButtonDown = true;
			}
		}
		else{
			switch (event.which) {
		        case 1:
		            SCG.gameControls.mousestate.leftButtonDown = true;
		            break;
		        case 2:
		            SCG.gameControls.mousestate.middleButtonDown = true;
		            break;
		        case 3:
		            SCG.gameControls.mousestate.rightButtonDown = true;
		            break;
		        default:
		            SCG.gameControls.mousestate.reset();
		            break;
	    	}
		}
		
	},
	mouseOut: function(event){
		SCG.gameControls.mousestate.reset();
	},
	mouseUp: function(event){
		if(event.type == 'touchstart')
		{
			if(event.originalEvent.changedTouches != undefined && event.originalEvent.changedTouches.length == 1)
			{
				SCG.gameControls.mousestate.leftButtonDown = false;
			}
		}
		else{
			switch (event.which) {
		        case 1:
		            SCG.gameControls.mousestate.leftButtonDown = false;
		            break;
		        case 2:
		            SCG.gameControls.mousestate.middleButtonDown = false;
		            break;
		        case 3:
		            SCG.gameControls.mousestate.rightButtonDown = false;
		            break;
		        default:
		            SCG.gameControls.mousestate.reset();
		            break;
		    }
		}
		event.preventDefault();
	},
	mouseMove: function(event){
		var oldPosition = SCG.gameControls.mousestate.position.clone();
		var eventPos = pointerEventToXY(event);
		var offset = $(SCG.canvas).offset();
		SCG.gameControls.mousestate.position = new Vector2(eventPos.x - SCG.canvas.margins.left,eventPos.y - SCG.canvas.margins.top);
		SCG.gameControls.mousestate.delta = SCG.gameControls.mousestate.position.substract(oldPosition,true);

		SCG.debugger.setValue(SCG.gameControls.mousestate.toString());
		//console.log(SCG.gameControls.mousestate.position);
	},
	orientationChangeEventInit: function() {
		var that = this;
		$(window).on('orientationchange resize', function(e){
			that.graphInit();
		});

		SCG.gameLogics.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		if(SCG.gameLogics.isMobile)
		{
			setTimeout( function(){ window.scrollTo(0, 1); }, 100 );
			$(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function(e){
				that.graphInit();
			});
		}
		

		this.graphInit();
	},
	graphInit: function(){
		SCG.gameLogics.messageToShow = '';
		SCG.gameLogics.wrongDeviceOrientation = !window.matchMedia("(orientation: landscape)").matches;
		if(SCG.gameLogics.wrongDeviceOrientation) {
			SCG.gameLogics.messageToShow = 'wrong device orientation - portrait';
			return;
		}

		var width =  window.innerWidth;
		if(width < SCG.battlefield.default.width)
		{
			SCG.gameLogics.messageToShow = String.format('width lesser than {3} (width: {0}, iH: {1}, iW: {2})',width, window.innerHeight, window.innerWidth, SCG.battlefield.default.width);
			SCG.gameLogics.wrongDeviceOrientation = true;
			return;
		}
		// var proportions = SCG.gameLogics.isMobile ?  (window.innerHeight / window.innerWidth) : (window.innerWidth / window.innerHeight);
		// SCG.gameControls.scale.times = (width / SCG.battlefield.default.width) / proportions;

		var _width = $(window).width();
		var _height = $(window).height();
		var ratioX = _width /SCG.battlefield.default.width;
		var ratioY = _height / SCG.battlefield.default.height;

		SCG.gameControls.scale.times = Math.min(ratioX, ratioY); //_width > _height ? _height / SCG.battlefield.default.height : _width /SCG.battlefield.default.width;

		if(SCG.gameControls.scale.times < 1)
		{
			SCG.gameLogics.messageToShow = String.format('window is to small (width: {0}, height: {1})', _width, _height);
			SCG.gameLogics.wrongDeviceOrientation = true;
			return;
		}

		//var oldSize = new Vector2(SCG.battlefield.width, SCG.battlefield.height);

		SCG.battlefield.width = SCG.battlefield.default.width * SCG.gameControls.scale.times;
		SCG.battlefield.height = SCG.battlefield.default.height * SCG.gameControls.scale.times;

		//var sizeChanges = new Vector2(SCG.battlefield.width / oldSize.x, SCG.battlefield.height / oldSize.y);

		var mTop = 0;
		var mLeft = 0;
		if(SCG.battlefield.width < _width)
		{
			mLeft = Math.round((_width - SCG.battlefield.width)/2);
		}
		else if(SCG.battlefield.height < _height)
		{
			mTop = Math.round((_height - SCG.battlefield.height)/2);
		}

		$(SCG.canvas).attr({'width':SCG.battlefield.width,'height':SCG.battlefield.height})
		$(SCG.canvas).css({'width':SCG.battlefield.width,'height':SCG.battlefield.height});
		$(SCG.canvas).css({'margin-top': mTop });
		$(SCG.canvas).css({'margin-left': mLeft });
		SCG.canvas.width = SCG.battlefield.width;
		SCG.canvas.height = SCG.battlefield.height;
		SCG.canvas.margins = {
			top : mTop,
			left: mLeft
		};
	},
	permanentEventInit : function (){
		var that = this;
		$(document).on('keydown',function(e){
			that.permanentKeyDown(e);
		});
		$(document).on('keyup',function(e){
			that.permanentKeyUp(e);
		});
		$(document).on('mousedown touchstart', SCG.canvasIdSelector,function(e){
			absorbTouchEvent(e);
			if(e.type == 'touchstart')
			{
				that.mouseMove(e);
			}
			that.mouseDown(e);
		});
		$(document).on('mouseup touchend', SCG.canvasIdSelector, function(e){
			absorbTouchEvent(e);
			that.mouseUp(e);
		});
		$(document).on('mouseout touchleave', SCG.canvasIdSelector, function(e){
			absorbTouchEvent(e);
			that.mouseOut(e);
		});
		$(document).on('mousemove touchmove', SCG.canvasIdSelector, function(e){
			absorbTouchEvent(e); 
			that.mouseMove(e);
		});
		$(document).on('contextmenu',SCG.canvasIdSelector, function(e){
			e.preventDefault();
			return false;
		});
	},
	permanentKeyDown : function (event)
	{
		this.keyboardstate.shiftPressed =event.shiftKey;
		this.keyboardstate.ctrlPressed =event.ctrlKey;
		this.keyboardstate.altPressed =event.altKey;
	},
	permanentKeyUp : function (event)
	{
		this.keyboardstate.shiftPressed =event.shiftKey;
		this.keyboardstate.ctrlPressed =event.ctrlKey;
		this.keyboardstate.altPressed =event.altKey;
		switch(event.which)
		{
			case 32:
				if(event.shiftKey){ 
					SCG.gameLogics.isPausedStep = true;
				}
				else{
					SCG.gameLogics.isPaused = !SCG.gameLogics.isPaused;	
				}
				break;
			case 69:
				SCG.GO.EnemyPaths.show = !SCG.GO.EnemyPaths.show;
				break;
			case 80: //show placeable
				SCG.Placeable.show = !SCG.Placeable.show;
				break;
			default:
				break;
		}
	}
};

SCG.gameControls.permanentEventInit();