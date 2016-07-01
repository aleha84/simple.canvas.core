var SCG = {};

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
		shifts: {
			left: false,
			right: false,
			up: false,
			down: false
		},
		free: function(){
			SCG.gameControls.camera.mode = 'free';
			this.centeredOn = undefined;
		},
		center: function(){
			if(SCG.gameControls.selectedGOs.length == 1){
				SCG.gameControls.camera.mode = 'centered';
				this.centeredOn = SCG.gameControls.selectedGOs[0];
			}
			else{
				SCG.gameControls.camera.mode = 'free';
				this.centeredOn = undefined;
			}
		},
		reset: function(){
			this.shifts.left = false;
			this.shifts.right = false;
			this.shifts.up = false;
			this.shifts.down = false;
		},
		update: function(now){
			if(this.mode === 'free'){
				var direction = undefined;
				if(this.shifts.left)
				{
					direction = Vector2.left();
				}
				if(this.shifts.right)
				{
					direction = Vector2.right();
				}
				if(this.shifts.up)
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
				if(this.shifts.down)
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
					var bfTL = SCG.viewfield.current.topLeft.clone();
					bfTL.add(delta);
					SCG.viewfield.current.update(bfTL);		
				}
			}
			else if(this.mode === 'centered' && this.centeredOn!== undefined){
				var newBftl = this.centeredOn.position.substract(new Vector2(SCG.viewfield.width/2,SCG.viewfield.height/2),true);
				SCG.viewfield.current.update(newBftl);
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
			for(var i = 0; i < this.eventHandlers.click.length;i++){
				var ch = this.eventHandlers.click[i];
				if(ch.renderBox!=undefined 
					&& ch.renderBox.isPointInside(SCG.gameControls.mousestate.position) 
					&& ch.handlers != undefined 
					&& ch.handlers.click != undefined 
					&& ch.handlers.click)
				{
					//to do add and check z-index
					ch.clickHandler();
				}
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
		var that = this;
		that.getEventAbsolutePosition(event);

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

		that.mousestate.doClickCheck();

		event.preventDefault();
	},
	mouseMove: function(event){
		var that = this;
		var oldPosition = SCG.gameControls.mousestate.position.clone();
		that.getEventAbsolutePosition(event);
		SCG.gameControls.mousestate.delta = SCG.gameControls.mousestate.position.substract(oldPosition);

		SCG.debugger.setValue(SCG.gameControls.mousestate.toString());
		//console.log(SCG.gameControls.mousestate.position);
	},
	getEventAbsolutePosition: function(event){
		var eventPos = pointerEventToXY(event);
		var offset = $(SCG.canvas).offset();
		SCG.gameControls.mousestate.position = new Vector2(eventPos.x - SCG.canvas.margins.left,eventPos.y - SCG.canvas.margins.top);
	},
	orientationChangeEventInit: function() {
		var that = this;

		SCG.gameControls.permanentEventInit();

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
		if(width < SCG.viewfield.default.width)
		{
			SCG.gameLogics.messageToShow = String.format('width lesser than {3} (width: {0}, iH: {1}, iW: {2})',width, window.innerHeight, window.innerWidth, SCG.viewfield.default.width);
			SCG.gameLogics.wrongDeviceOrientation = true;
			return;
		}
		// var proportions = SCG.gameLogics.isMobile ?  (window.innerHeight / window.innerWidth) : (window.innerWidth / window.innerHeight);
		// SCG.gameControls.scale.times = (width / SCG.viewfield.default.width) / proportions;

		var _width = $(window).width();
		var _height = $(window).height();
		var ratioX = _width /SCG.viewfield.default.width;
		var ratioY = _height / SCG.viewfield.default.height;

		SCG.gameControls.scale.times = Math.min(ratioX, ratioY); //_width > _height ? _height / SCG.viewfield.default.height : _width /SCG.viewfield.default.width;

		if(SCG.gameControls.scale.times < 1)
		{
			SCG.gameLogics.messageToShow = String.format('window is to small (width: {0}, height: {1})', _width, _height);
			SCG.gameLogics.wrongDeviceOrientation = true;
			return;
		}

		//var oldSize = new Vector2(SCG.viewfield.width, SCG.viewfield.height);

		SCG.viewfield.width = SCG.viewfield.default.width * SCG.gameControls.scale.times;
		SCG.viewfield.height = SCG.viewfield.default.height * SCG.gameControls.scale.times;

		//var sizeChanges = new Vector2(SCG.viewfield.width / oldSize.x, SCG.viewfield.height / oldSize.y);

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

		$(SCG.canvas).attr({'width':SCG.viewfield.width,'height':SCG.viewfield.height})
		$(SCG.canvas).css({'width':SCG.viewfield.width,'height':SCG.viewfield.height});
		$(SCG.canvas).css({'margin-top': mTop });
		$(SCG.canvas).css({'margin-left': mLeft });
		SCG.canvas.width = SCG.viewfield.width;
		SCG.canvas.height = SCG.viewfield.height;
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

		// $(document).on('click',SCG.canvasIdSelector, function(e){
		// 	absorbTouchEvent(e);
		// 	that.click(e);
		// });
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