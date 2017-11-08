var GistLoader = function() {
	this.gist = ''
}

GistLoader.prototype.load = function(addr, region, chip) {
	return 0;
}

GistLoader.prototype.store = function(addr, value, region, chip) {
	var hex = value.toString(16)
	if (value < 0x10)
		hex = '0' + hex
	this.gist += hex

	if (this.gist.length === 20) {
		var gist = this.gist
		console.log('LOADING GIST', gist)
		this.gist = ''
		runGistById(gist)
	}
}

xoioRegisterDevice(IO_ID_GIST, function(chip) { chip.registerIODevice(IO_ID_GIST, 1, new GistLoader()) })
