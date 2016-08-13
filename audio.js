SCG.audio = {
	pause: false,
	initialized: false,
	mute: false, 
	players: [],
	notes: {
		dur: {
			_1: 1,
			_2: 0.5,
			_4: 0.25,
			_8: 0.125,
			_16: 0.0625,
			_32: 0.03125
		},
		// o1:{
		// 	c: 261.63, // до
		// 	c_sh: 277.18, 
		// 	d: 293.66, // ре
		// 	d_sh: 311.13,
		// 	e: 329.63, // ми
		// 	f: 349.23, // фа
		// 	f_sh: 369.99,
		// 	g: 392.00, // соль
		// 	g_sh: 415.30,
		// 	a: 440.00, // ля
		// 	h_fl: 466.16,
		// 	h: 493.88 // си
		// }
		pause: 0
	},
	init : function(){
		if(this.initialized){return;}
		try {
			// Fix up for prefixing
			window.AudioContext = window.AudioContext||window.webkitAudioContext;
			this.context = new AudioContext();
		}
		catch(e) {
			alert('Web Audio API is not supported in this browser');
		}

		var nNames = ['c','c_sh','d', 'd_sh','e','f','f_sh','g','g_sh','a','a_sh','h'];
		for(var oIndex = 0;oIndex <9;oIndex++){
			this.notes['o'+oIndex] = {};
			for(var nIndex = 0;nIndex<12;nIndex++){
				this.notes['o'+oIndex][nNames[nIndex]]=440* Math.pow(2, ((oIndex-4)*12 +(nIndex-9)) / 12);
			}
		}

		this.initialized = true;

	},
	playPause: function (pause) {
		this.connectToggle(pause);
	},
	muteToggle: function(){
		this.mute = !this.mute;
		this.connectToggle(this.mute);
	},
	connectToggle: function(state){
		for(var i =0;i<this.players.length;i++){
			this.players[i].connectToggle(state);
		}
	},
	update: function(now){
		var i = this.players.length;
		while (i--) {
			var p = this.players[i];
			p.update(now);
			
			if(!p.isAlive){
				this.players.splice(i,1);
			}
		}
	},
	start: function(props){
		if(!this.initialized){this.init();}
		props.context = this.context;
		props.mute = this.mute;
		this.players.push(new SCG.audio.Player(props));
	}
};

SCG.audio.init();

SCG.audio.Player = function(prop){
	this.loop = false;
	this.notes = [];
	this.noteIndex = -1;
	this.curVol= 0;
	this.maxVol= 0.05;
	this.context = undefined;
	this.gainNodes  = [];
	this.currentNote = undefined;
	this.isAlive = true;
	this.length = 1000;
	this.type = 'triangle';
	this.notesChangeTimer= {
		ignorePause: true,
		lastTimeWork: new Date,
		delta : 0,
		currentDelay: 0,
		originDelay: 0,
		doWorkInternal : undefined,
		context: undefined
	};

	if(prop == undefined)
	{
		throw 'SCG.audio.Player -> props are undefined';
	}

	extend(true, this, prop);

	this.notesChangeTimer.doWorkInternal = this.noteChange;
	this.notesChangeTimer.context = this;

	this.curVol = this.maxVol;

	this.noteIndex = -1;
	this.noteChange();
}

SCG.audio.Player.prototype = {
	constructor: SCG.audio.Player,
	update: function(now){
		if(this.isAlive){
			doWorkByTimer(this.notesChangeTimer, now);	
		}
	},
	noteChange: function(){
		if(!this.isAlive){ return; }

		this.noteIndex++;

		if(this.noteIndex >= this.notes.length){
			if(!this.loop){
				this.isAlive = false;
				return;
			}
			else{
				this.noteIndex = 0;
			}
		}

		this.setValues(this.notes[this.noteIndex]);
	},
	setValues: function(cn){
		//console.log(cn);
		var notes = [];
		this.gainNodes = [];
		isArray(cn.value) ? notes = cn.value : notes.push(cn.value);
		var duration = cn.duration*this.length;
		for(var n = 0;n<notes.length;n++){
			if(notes[n] == 0){continue;}
			var oscillator = this.context.createOscillator();
			var gainNode = this.context.createGain();

			if(!this.mute){
				oscillator.connect(gainNode);
				gainNode.connect(this.context.destination);	
			}

			oscillator.type = this.type;
			gainNode.gain.value = this.maxVol;
			gainNode.gain.setValueAtTime(this.curVol, this.context.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + (duration*3/1000));
			oscillator.frequency.value = notes[n];

			this.gainNodes.push(gainNode);
			oscillator.start(0);
			oscillator.stop(this.context.currentTime + cn.duration*4);
			oscillator.onended = function() {
			  gainNode.disconnect();
			}
		}

		this.notesChangeTimer.originDelay = duration;
		this.notesChangeTimer.currentDelay = duration;
	},
	connectToggle: function(connect){
		this.mute = connect;
		for(var gn=0;gn<this.gainNodes.length;gn++){
			connect ? this.gainNodes[gn].disconnect(this.context.destination) : this.gainNodes[gn].connect(this.context.destination);	
		}
		
	}
}