SCG.audio = {
	context : undefined,
	oscillator : undefined,
	gainNode  : undefined,
	currentNote : undefined,
	queues: [],
	queueCurrentIndex: -1,
	noteCurrentIndex: -1,
	loop: true,
	pause: false,
	maxVol: 0.05,
	mute: false, 
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
		if(this.queues.length == 0) {return;}

		try {
			// Fix up for prefixing
			window.AudioContext = window.AudioContext||window.webkitAudioContext;
			this.context = new AudioContext();
		}
		catch(e) {
			alert('Web Audio API is not supported in this browser');
		}

		if(this.context == undefined){
			return;
		}

		this.oscillator = this.context.createOscillator();
		this.gainNode = this.context.createGain();
		this.filter = this.context.createBiquadFilter();

		this.oscillator.connect(this.filter);
		this.filter.connect(this.gainNode);
		this.gainNode.connect(this.context.destination);

		this.filter.type = 'lowpass';
		this.filter.frequency.value = 440;
		this.oscillator.type = 'triangle';
		this.oscillator.frequency.value = 0;
		this.oscillator.detune.value = 100; // value in cents

		this.gainNode.gain.value = this.maxVol;

		this.notesChangeTimer.doWorkInternal = this.noteChange;
		this.notesChangeTimer.context = this;

		this.setValues(this.queues[this.queueCurrentIndex][this.noteCurrentIndex]);

		this.oscillator.start(0);
	},
	addToQueue: function(notes){
		if(!isArray(notes) || notes.length == 0){ throw 'Notes array is empty!';}
		this.queues.push(notes);
		this.queueCurrentIndex = 0;
		this.noteCurrentIndex = 0;
	},
	playPause: function () {
		if(!this.oscillator) {return;}
		
		this.pause = !this.pause;
		this.pause ? this.gainNode.disconnect(this.context.destination) : this.gainNode.connect(this.context.destination);
	},
	muteToggle: function(){
		if(!this.oscillator) {return;}
		
		this.mute = !this.mute;
		this.mute ? this.gainNode.gain.value = 0 : this.gainNode.gain.value = this.maxVol;

		SCG.UI.invalidate();
	},
	update: function(now){
		if(!this.oscillator) {return;}
		doWorkByTimer(this.notesChangeTimer, now);
	},
	noteChange: function(){
		var currentQueue = this.queues[this.queueCurrentIndex];
		if(this.noteCurrentIndex == currentQueue.length-1){
			if(this.queueCurrentIndex == this.queues.length-1){
				this.queueCurrentIndex = 0;
			}
			else{
				this.queueCurrentIndex++;
			}
			currentQueue = this.queues[this.queueCurrentIndex];
			this.noteCurrentIndex = 0;
		}
		else{
			this.noteCurrentIndex++;
		}

		this.setValues(currentQueue[this.noteCurrentIndex]);
	},
	setValues: function(cn){
		this.oscillator.frequency.value = cn.value;
		this.notesChangeTimer.originDelay = cn.duration;
		this.notesChangeTimer.currentDelay = cn.duration;
	}
};
