//ym2612 emulator is taken from https://github.com/apollolux/ym2612-js

var YM2612Driver = function() {
	this._callback = this._generate.bind(this)
	this.ym = null
}

YM2612Driver.prototype._generate = function(e) {
	var ctx = e.currentTarget.context
	if (this.ym === null) {
		console.log('creating ym2612 with sample rate ' + ctx.sampleRate)
		var ym = new YM2612()
		ym.init(7670448, ctx.sampleRate)
		ym.config(9)
		ym.reset()
		ym.write(0x28, 0)
		this.ym = ym
	}
	var dst = e.outputBuffer
	var dstN = dst.length
	var ymData = this.ym.update(dstN)

	for(var i = 0; i < dstN; ++i) {
		dst[i] += (ymData[0][i] + ymData[1][i]) / 2
	}
}

YM2612Driver.prototype.init = function(chip) {
	registerAudioCallback(this._callback)
}

YM2612Driver.prototype.deinit = function(chip) {
	deregisterAudioCallback(this._callback)
	this.ym = null
}

YM2612Driver.prototype.load = function(addr, region, chip) {
	return 0;
}

YM2612Driver.prototype.store = function(addr, value, region, chip) {
}

xoioRegisterDevice(IO_ID_YM2612, function(chip) { chip.registerIODevice(IO_ID_YM2612, 2, new YM2612Driver()) })
