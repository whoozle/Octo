var MouseDriver = function() {
}

MouseDriver.prototype.load = function(addr, region, chip) {
	return chip.mouseState[addr]
}

MouseDriver.prototype.store = function(addr, value, region, chip) {
}

xoioRegisterDevice(IO_ID_MOUSE, function(chip) { chip.registerIODevice(IO_ID_MOUSE, 3, new MouseDriver()) })
