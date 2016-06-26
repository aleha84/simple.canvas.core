$(document).ready(function () {
	var scene1 = {
		name: "demo1",
		preMainWork: function() {
			SCG.context.beginPath();
			SCG.context.rect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
			SCG.context.fillStyle = 'yellow';
			SCG.context.fill();
		}
	}	

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})