SCG.src = {
	// example: background: 'content/images/background.png',
}

SCG.images = {
}

SCG.contexts = {
}

SCG.globals = {
  addDefaultUIButtons: true
}

SCG.customInitializaers = [];

window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
})();


SCG.initializer = function(callback) {
    var loadedImages = 0;
    var numImages = 0;
    // get num of sources
    for(var src in SCG.src) {
      numImages++;
    }

    for(var src in SCG.src) {
		SCG.images[src] = new Image();
		SCG.images[src].onload = function() {
			if(++loadedImages >= numImages) {
				callback();
			}
		}
		SCG.images[src].src = SCG.src[src];
    }

    if(numImages == 0)
    {
    	callback();
    }
}

SCG.customInitialization = function(){
	if(SCG.customInitializaers.length == 0){
		return;
	}

	for(var i=0;i<SCG.customInitializaers.length;i++){
		if(isFunction(SCG.customInitializaers[i])){
			SCG.customInitializaers[i]();
		}
	}
}