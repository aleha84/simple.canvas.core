$(document).ready(function () {
	var scene1 = {
		name: "demo1",
		preMainWork: function() {
			SCG.context.beginPath();
			SCG.context.rect(0, 0, SCG.viewfield.width, SCG.viewfield.height);
			SCG.context.fillStyle = 'yellow';
			SCG.context.fill();
		},
		gameObjectsBaseProperties: [
			{ 
				type: 'demoObject',
				size: new Vector2(10,10),
				isCustomRender: true,
				customRender: function() {
					SCG.context.beginPath();
					SCG.context.rect(this.renderPosition.x - this.renderSize.x/2, this.renderPosition.y - this.renderSize.y/2, this.renderSize.x, this.renderSize.y);
					SCG.context.fillStyle = 'gray';
					SCG.context.fill()
				}
			}
		],
		gameObjectGenerator: function () {
			var gos = [];
			gos.push(SCG.GO.create("demoObject", {
				position: new Vector2(150, 150)
			}));

			gos.push(SCG.GO.create("demoObject", {
				position: new Vector2(300, 200),
				size: new Vector2(20,20)
			}));

			return gos;
		}
	}	

	SCG.scenes.registerScene(scene1);

	SCG.scenes.selectScene(scene1.name);

	SCG.start();
})