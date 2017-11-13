var SettingsDriver = function() {
	this.data = []
}

SettingsDriver.prototype.load = function(addr, region, chip) {
	return 0;
}

SettingsDriver.prototype._toHex = function(value) {
	if (value < 16)
		return '0' + value.toString(16)
	else
		return value.toString(16)
}
SettingsDriver.prototype._getColor = function(chip, offset) {
	var src = chip.m
	return '#' + this._toHex(src[offset]) + this._toHex(src[offset + 1]) + this._toHex(src[offset + 2])
}

SettingsDriver.prototype.store = function(addr, value, region, chip) {
	this.data.push(value)
	if (this.data.length === 2) {
		var offset = (this.data[0] << 8) | this.data[1]
		chip.backgroundColor = this._getColor(chip, offset + 0)
		chip.fillColor1 = this._getColor(chip, offset + 3)
		chip.fillColor2 = this._getColor(chip, offset + 6)
		chip.blendColor = this._getColor(chip, offset + 9)
		chip.buzzColor = this._getColor(chip, offset + 12)
		chip.quietColor = this._getColor(chip,  offset + 15)
		this.data = []
	}
}

xoioRegisterDevice(IO_ID_SETTINGS, function(chip) { chip.registerIODevice(IO_ID_SETTINGS, 1, new SettingsDriver()) })
