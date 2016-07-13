SCG.debugger = 
{
	el:  getDOMByClassName('.debugger'),
	initialized : false,
	init: function() { 
		this.el = getDOMByClassName('.debugger');
		if(this.el == undefined){
			this.el = appendDomElement(document.body, 'div', { class: 'debugger'});
		}
		this.initialized = true;
	},
	clear : function() { this.setValue('') },
	setValue : function(value) { 
		if(!this.initialized)
		{
			this.init();	
		}
		//this.el.html(value); 
		this.el.innerHTML = value;
	}
}