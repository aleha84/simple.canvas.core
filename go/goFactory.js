SCG.GO.goBaseProperties = {};

SCG.GO.create = function(name, specificProperties){
	if(name == undefined)
	{
		throw "SCG.GO.create -> name is empty";
	}

	if(specificProperties == undefined){
		specificProperties = {};
	}

	var baseProperties = SCG.GO.goBaseProperties[name];
	if(baseProperties == undefined){
		throw "SCG.GO.create -> can't find base properties ba provided name " + name;	
	}
	
	return new SCG.GO.GO(extend(true, {}, baseProperties, specificProperties));
}

SCG.GO.register = function(name, baseProperties){
	if(name == undefined)
	{
		throw "SCG.GO.register -> name is empty";
	}

	if(baseProperties == undefined){
		throw "SCG.GO.register -> baseProperties is undefined";
	}

	SCG.GO.goBaseProperties[name] = baseProperties;
}