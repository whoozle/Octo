var GistLoader = function() { }

GistLoader.prototype.load = function(addr, region, chip) {
	return 0;
}

GistLoader.prototype.store = function(addr, value, region, chip) {
	console.log('GIST', addr, value)
}

xoioRegisterDevice(function(chip) { chip.registerIODevice(1, new GistLoader()) })
