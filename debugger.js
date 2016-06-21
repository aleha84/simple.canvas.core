SCG.debugger = 
{
	el: $('.debugger'),
	initialized : false,
	init: function() { 
		this.el = $('.debugger');
		if(this.el.length == 0){
			$(document.body).append($('<div />', { class: 'debugger'}));
		}
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