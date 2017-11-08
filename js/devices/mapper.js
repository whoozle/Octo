var IO_ID_MAPPER   = 0
var IO_ID_GIST     = 1
var IO_ID_MOUSE    = 2
var IO_ID_GAMEPAD1 = 3
var IO_ID_GAMEPAD2 = 4
var IO_ID_YM2612   = 5

var IORegion = function(id, base, size, device, chip) {
	device.id = id
	device.base = base

	this.id   = id
	this.base = base
	this.size = size
	this.device = device
	this.chip = chip
}

IORegion.prototype.load = function(addr) {
	addr -= this.base
	if (addr < 0 || addr >= this.size)
		throw new Error('Out of bound exception: address 0x' + addr.toString(16) + ' with base 0x' + addr.toString(16))
	return this.device.load(addr, this, this.chip)
}

IORegion.prototype.store = function(addr, value) {
	addr -= this.base
	if (addr < 0 || addr >= this.size)
		throw new Error('Out of bound exception: address 0x' + addr.toString(16) + ' with base 0x' + addr.toString(16))
	this.device.store(addr, value, this, this.chip)
}

var XOMapper = function() {
	this._state = [0xff, 0xff]
}

XOMapper.prototype.resetState = function() {
	this._state[0] = this._state[1] = 0xff
}

XOMapper.prototype.load = function(addr, region, chip) {
	return this._state[addr];
}

XOMapper.prototype.store = function(addr, value, region, chip) {
	this.resetState()
	switch(addr) {
	case 0:
		if (value & 0x80) {
			var newDevice = value & 0x7f
			var createDevice = _deviceList[newDevice] //add multiple device support here, e.g. gamepads
			createDevice(chip)
		} else {
			for(var i = 0; i < chip.ioDevices.length; ++i) {
				var device = chip.ioDevices[i]
				if (device.id === value) {
					this._state[0] = device.base >> 8
					this._state[1] = device.base & 0xff
					break
				}
			}
		}
		break
	case 1:
		switch(value) {
		case 1:
			chip.initXOIO(true) //fixme: check reset sequence
			break
		case 2:
			chip.initXOIO(false)
		break
		}
	}
}

var _deviceList = { }
var _mapperDeviceList = []

function xoioRegisterMapperDevice(callback) {
	_mapperDeviceList.push(callback)
}

function xoioRegisterDevice(id, callback) {
	if (id in _deviceList)
		throw new Error('duplicate id ' + id + ' for device')
	_deviceList[id] = callback
}

xoioRegisterMapperDevice(function(chip) { chip.registerIODevice(IO_ID_MAPPER, 2, new XOMapper()) })
