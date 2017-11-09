// Implement a full keyboard device
//
// Considered three concepts:
//  - Event-based: key event FIFO, read register to read event code, each read remvoes an event from the queue
//  - Poll "Is nnn key pressed?"
//  - Big array of bits: One for each key; 1 = pressed, 0 = not pressed
//
// Poll is simple, onlu needs 1 byte, is orthoginal to the chip8 keyboard system,
// and I like the idea of the chip8 program being responsible for an event system.
//
// To use:
//   1. Write a keycode to byte 0
//   2. Read byte 0. A result of 0 indicates that key is not pressed. A result of 1 indicates that key is pressed.
//
// See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode for information on keyCode values.

// TODO: Should remove listeners on teardown


var Keyboard = function() {
	this.requested = null;
	this.keys = {};

	this._keydown = function(event) {
		//console.log(event.keyCode);
		self.keys[event.keyCode] = true;
	}
	this._keyup = function(event) {
		//console.log(event.keyCode);
		self.keys[event.keyCode] = false;
	}
}

Keyboard.prototype.init = function(chip) {
	var self = this
	window.addEventListener("keydown", this._keydown, false);
	window.addEventListener("keyup", this._keyup, false);
}

Keyboard.prototype.deinit = function(chip) {
	window.removeEventListener("keydown", this._keydown, false);
	window.removeEventListener("keyup", this._keyup, false);
}

Keyboard.prototype.load = function(addr, region, chip) {
	var req = this.requested;
	if(keyboard_keys[req] == true) {
		return 1;
	}
	return 0;
}

Keyboard.prototype.store = function(addr, value, region, chip) {
	this.requested = value;
}

xoioRegisterDevice(IO_ID_KEYBOARD, function(chip) { chip.registerIODevice(IO_ID_KEYBOARD, 1, new Keyboard()) })
