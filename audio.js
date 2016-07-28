SCG.audio = {
	pause: false,
	initialized: false,
	mute: false, 
	players: [],
	notes: {
		dur: {
			whole: 1000,
			half: 500,
			quarter: 250,
			eight: 125,
			sixteenth: 62.5,
			thirtySecond: 31.25
		},
		o1:{
			c: 261.63, // до
			c_sh: 277.18, 
			d: 293.66, // ре
			d_sh: 311.13,
			e: 329.63, // ми
			f: 349.23, // фа
			f_sh: 369.99,
			g: 392.00, // соль
			g_sh: 415.30,
			a: 440.00, // ля
			h_fl: 466.16,
			h: 493.88 // си
		},
		o2:{
			c: 523.25, // до
			c_sh: 554.36, 
			d: 587.32, // ре
			d_sh: 622.26,
			e: 659.26, // ми
			f: 698.46, // фа
			f_sh: 739.98,
			g: 784.00, // соль
			g_sh: 830.60,
			a: 880.00, // ля
			h_fl: 932.32,
			h: 987.75 // си
		},
		pause: 0
	},
	notesChangeTimer: {
		ignorePause: true,
		lastTimeWork: new Date,
		delta : 0,
		currentDelay: 0,
		originDelay: 0,
		doWorkInternal : undefined,
		context: undefined
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

		this.initialized = true;

	},
	playPause: function () {
		this.pause = !this.pause;
		for(var i =0;i<this.players.length;i++){
			this.players[i].connectToggle(this.pause);
		}
	},
	muteToggle: function(){
		this.mute = !this.mute;
		for(var i =0;i<this.players.length;i++){
			this.players[i].connectToggle(this.mute);
		}
		SCG.UI.invalidate();
	},
	update: function(now){
		var i = this.players.length;
		while (i--) {
			var p = this.players[i];
			p.update(now);
			
			if(!p.isAlive){
				var deleted = this.players.splice(i,1);
			}
		}
	},
	start: function(props){
		if(!this.initialized){this.init();}
		props.context = this.context;
		this.players.push(new SCG.audio.Player(props));
	}
};

SCG.audio.Player = function(prop){
	this.loop = false;
	this.notes = [];
	this.noteIndex = -1;
	this.curVol= 0;
	this.maxVol= 0.05;
	this.context = undefined;
	this.oscillator = undefined;
	this.gainNode  = undefined;
	this.currentNote = undefined;
	this.isAlive = true;
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
		this.oscillator = this.context.createOscillator();
		this.gainNode = this.context.createGain();
		if(!this.mute){
			this.oscillator.connect(this.gainNode);
			this.gainNode.connect(this.context.destination);	
		}
		
		this.oscillator.type = 'triangle';
		this.gainNode.gain.value = this.maxVol;

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
		this.gainNode.gain.setValueAtTime(this.curVol, this.context.currentTime);
		this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + (cn.duration*3/1000));

		this.oscillator.frequency.value = cn.value;
		this.notesChangeTimer.originDelay = cn.duration;
		this.notesChangeTimer.currentDelay = cn.duration;

		this.oscillator.start(0);
	},
	connectToggle: function(connect){
		this.mute = connect;
		connect ? this.gainNode.disconnect(this.context.destination) : this.gainNode.connect(this.context.destination);
	}
}