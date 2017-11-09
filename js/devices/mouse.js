var MouseDriver = function(chip) {
	this.chip = chip
}

MouseDriver.prototype.setMouseState = function(x, y, buttons) {
	var chip = this.chip
	var size = chip.hires ? scaleFactor : scaleFactor*2;

	y = Math.floor(y / size)
	x = Math.floor(x / size)

	chip.mouseState[0] = x
	chip.mouseState[1] = y

	var fifo = chip.mouseState[2]
	var len = fifo.length
	var currentState = len > 0? fifo[len - 1]: 0
	if (currentState !== buttons)
		fifo.push(buttons) //limit fifo length?
}

MouseDriver.prototype.handleMouseEvent = function(e) {
	this.setMouseState(e.offsetX, e.offsetY, e.buttons)
	e.preventDefault()
}


MouseDriver.prototype.init = function(chip) {
	chip.mouseState = [0, 0, []]

	var handleMouseEvent = this.handleMouseEvent.bind(this)
	this._handler = handleMouseEvent

	document.getElementById("target").addEventListener("mousemove", handleMouseEvent, false)
	document.getElementById("target").addEventListener("click", handleMouseEvent, false)
	document.getElementById("target").addEventListener("contextmenu", handleMouseEvent, false)
}

MouseDriver.prototype.deinit = function(chip) {
	var handleMouseEvent = this._handler
	document.getElementById("target").removeEventListener("mousemove", handleMouseEvent, false);
	document.getElementById("target").removeEventListener("click", handleMouseEvent, false);
	document.getElementById("target").removeEventListener("contextmenu", handleMouseEvent, false);

	delete chip.mouseState
}

MouseDriver.prototype.load = function(addr, region, chip) {
	if (addr === 2) {
		var fifo = chip.mouseState[addr]
		var next = fifo.pop()
		return next !== undefined? next: 0
	}
	return chip.mouseState[addr]
}

MouseDriver.prototype.store = function(addr, value, region, chip) {
}

xoioRegisterDevice(IO_ID_MOUSE, function(chip) { chip.registerIODevice(IO_ID_MOUSE, 3, new MouseDriver(chip)) })
