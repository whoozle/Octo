"use strict";

////////////////////////////////////
//
//   Emulator Execution
//
////////////////////////////////////

var scaleFactor = 5;
var renderTarget = "target";

function unpackOptions(emulator, options) {
	var flags = [
		"tickrate",
		"fillColor",
		"fillColor2",
		"blendColor",
		"backgroundColor",
		"buzzColor",
		"quietColor",
		"shiftQuirks",
		"loadStoreQuirks",
		"vfOrderQuirks",
		"clipQuirks",
		"jumpQuirks",
		"enableXO",
		"screenRotation",
	]
	for (var x = 0; x < flags.length; x++) {
		var flag = flags[x];
		if (options[flag]) { emulator[flag] = options[flag]; }
	}
}

function setRenderTarget(scale, canvas) {
	scaleFactor = scale;
	renderTarget = canvas;
	var c = document.getElementById(canvas);

	// Remove any existing previous delta frame so first frame is always drawn:
	c.last = undefined;

	var w  = scaleFactor * 128;
	var h  = scaleFactor *  64;
	var wm = (scaleFactor * -64) + "px";
	var hm = (scaleFactor * -32) + "px";

	if (emulator.screenRotation == 90 || emulator.screenRotation == 270) {
		c.width  = h;
		c.height = w;
		c.style.marginLeft = hm;
		c.style.marginTop  = wm;
	}
	else {
		c.width  = w;
		c.height = h;
		c.style.marginLeft = wm;
		c.style.marginTop  = hm;
	}
}

function getTransform(emulator, g) {
	g.setTransform(1, 0, 0, 1, 0, 0);
	var x = scaleFactor * 128;
	var y = scaleFactor *  64;
	switch(emulator.screenRotation) {
		case 90:
			g.rotate(0.5 * Math.PI);
			g.translate(0, -y);
			break;
		case 180:
			g.rotate(1.0 * Math.PI);
			g.translate(-x, -y);
			break;
		case 270:
			g.rotate(1.5 * Math.PI);
			g.translate(-x, 0);
			break;
		default:
			/* nothing to do */
	}
}


function arrayEqual(a, b) {
	var length = a.length;
	if (length !== b.length) { return false; }
	for (var i = 0; i < length; i++) {
		if (a[i] !== b[i]) { return false; }
	}
	return true;
}

function getColor(id) {
	switch(id) {
		case 0: return emulator.backgroundColor;
		case 1: return emulator.fillColor;
		case 2: return emulator.fillColor2;
		case 3: return emulator.blendColor;
	}
	throw "invalid color: " + id;
}

function renderDisplay(emulator) {
	var c = document.getElementById(renderTarget);

	// Canvas rendering can be expensive. Exit out early if nothing has changed.
	// NOTE: toggling emulator.hires changes emulator.p dimensions.
	var colors = [emulator.backColor, emulator.fillColor, emulator.fillColor2, emulator.blendColor];
	if (c.last !== undefined
			&& arrayEqual(c.last.p[0], emulator.p[0]) && arrayEqual(c.last.p[1], emulator.p[1])
			&& arrayEqual(c.last.colors, colors)) {
		return;
	}
	c.last = {
		colors: colors,
		p: [emulator.p[0].slice(), emulator.p[1].slice()]
	};

	var g = c.getContext("2d");
	getTransform(emulator, g);
	g.fillStyle = emulator.backgroundColor;
	g.fillRect(0, 0, c.width, c.height);
	var max    = emulator.hires ? 128*64      : 64*32;
	var stride = emulator.hires ? 128         : 64;
	var size   = emulator.hires ? scaleFactor : scaleFactor*2;

	for(var z = 0; z < max; z++) {
		var color = getColor(emulator.p[0][z] + (emulator.p[1][z] * 2));
		if (color == emulator.backColor) {
			continue;  // it's pointless to draw the background color
		}
		g.fillStyle = color;
		g.fillRect(
			Math.floor(z%stride)*size,
			Math.floor(z/stride)*size,
			size, size
		);
	}
}

////////////////////////////////////
//
//   Audio Playback
//
////////////////////////////////////

var audio;
var audioNode;
var audioSource;
var audioDataTimestamp = undefined;
var audioData = [];
var chip8SampleRate = 4000;
var audioVolume = 0.25;

function audioSetup() {
	if (!audio) {
		if (typeof AudioContext !== 'undefined') {
			audio = new AudioContext();
		}
		else if (typeof webkitAudioContext !== 'undefined') {
			audio = new webkitAudioContext();
		}
	}
	if (audio && !audioNode) {
		audioNode = audio.createScriptProcessor(4096, 1, 1);
		var sampleRate = audioNode.context.sampleRate;
		audioNode.onaudioprocess = function(audioProcessingEvent) {
			var outputBuffer = audioProcessingEvent.outputBuffer;
			var outputData = outputBuffer.getChannelData(0);
			var dstLength = outputBuffer.length;
			var srcLength = audioData.length;

			var ts = Date.now();
			var srcTs = audioDataTimestamp;
			for(var i = 0; i < dstLength; ++i) {
				var srcIndex = Math.floor(i * srcLength * 8 / dstLength);
				var cell = srcIndex >> 3;
				var bit = srcIndex & 7;
				outputData[i] = (audioData[cell] & (0x80 >> bit)) ? audioVolume: 0;
			}
			audioData = [];
			audioDataTimestamp = undefined;
		}
		audioData = [];
		audioNode.connect(audio.destination);
		return true;
	}
	if (audio && audioNode) { return true; }
	return false;
}

function stopAudio() {
	if (!audio) { return; }
	if (audioNode) {
		audioNode.disconnect();
		audioNode = null;
	}
	audioData = [];
}

function playPattern(soundLength, buffer) {
	if (!audio) { return; }

	console.log('playPattern', soundLength, buffer)
}

function enqueuePattern(ts, data) {
	if (audioDataTimestamp === undefined)
		audioDataTimestamp = ts;
	audioData = audioData.concat(data)
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
