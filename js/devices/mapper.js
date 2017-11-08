var XOMapper = function() { }

XOMapper.prototype.load = function(addr, region, chip) {
	return 0;
}

XOMapper.prototype.store = function(addr, value, region, chip) {
	if (value & 0x80) //probe
		return

	if (value & 1) {
		console.log('mapper: initialise in compatible mode');
		chip.initXOIO(true)
	} else if (value & 2) {
		console.log('mapper: initialise in wide io range mode');
		chip.initXOIO(false)
	}
}

xoioRegisterMapperDevice(function(chip) { chip.registerIODevice(1, new XOMapper()) })
