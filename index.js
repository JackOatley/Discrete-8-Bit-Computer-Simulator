import { demos } from "./demos.js";

//------------------------------------------------------------------------------
// gui setup
//------------------------------------------------------------------------------
const codeEditor = document.getElementById('code');
const lineNumbers = document.getElementById('numbers');
const disBinary = document.getElementById('binary');
const disOctal = document.getElementById('octal');
const disHex = document.getElementById('hex');
const display = document.getElementById('display');
const clockSlider = document.getElementById('clockSlider');
const clockNumber = document.getElementById('clockNumber');
codeEditor.value = demos['Fibonacci 1'];

// fill out line numbers
for (let n=0; n<256; n++)
	lineNumbers.value += n + '\n';

//------------------------------------------------------------------------------
// hardware modules
//------------------------------------------------------------------------------

const programCounter = {
	value: 0
}

const flagRegister = {
	value: 0
}

const registerA = {
	value: 0
}

const registerB = {
	value: 0
}

const registerC = {
	value: 0
}

const registerD = {
	value: 0
}

const memoryAddressRegister = {
	value: 0
}

const ram = [];

//------------------------------------------------------------------------------
// instructions
//------------------------------------------------------------------------------

function FETCH() {
	programCounter.value++;
	programCounter.value &= 255;
	memoryAddressRegister.value = programCounter.value;
}

function NOP() {
	FETCH();
}

function LDA() {
	FETCH();
	const op = ram[programCounter.value++];
	programCounter.value &= 255;
	memoryAddressRegister.value = op;
	registerA.value = ram[op];
}

function STA() {
	FETCH();
	const op = ram[programCounter.value++];
	programCounter.value &= 255;
	memoryAddressRegister.value = op & 255;
	ram[op] = registerA.value & 255;
}

function STB() {
	FETCH();
	const op = ram[programCounter.value++];
	programCounter.value &= 255;
	memoryAddressRegister.value = op;
	ram[op] = registerB.value;
}

function SEA() {
	FETCH();
	const op = ram[programCounter.value++];
	registerA.value = op;
}

function SEB() {
	FETCH();
	const op = ram[programCounter.value++];
	registerB.value = op;
}

function ADD() {
	FETCH();
	const op = ram[programCounter.value++] & 255;
	programCounter.value &= 255;
	memoryAddressRegister.value = op & 255;
	registerB.value = ram[op] & 255;
	flagRegister.value = (((registerA.value + registerB.value) >> 8) & 1);
	registerC.value = (registerA.value + registerB.value) & 0xFF;
	registerA.value = registerC.value;
}

function AWC() {
	FETCH();
	const op = ram[programCounter.value++] & 255;
	programCounter.value &= 255;
	memoryAddressRegister.value = op & 255;
	registerB.value = ram[op] & 255;
	const cin = flagRegister.value & 1;
	flagRegister.value = (((registerA.value + registerB.value + cin) >> 8) & 1);
	registerC.value = (registerA.value + registerB.value + cin) & 0xFF;
	registerA.value = registerC.value;
}

function ADR() {
	FETCH();
	registerC.value = (registerA.value + registerB.value) & 0xFF;
	registerA.value = registerC.value;
}

function SWP() {
	FETCH();
	registerC.value = registerA.value;
	registerA.value = registerB.value;
	registerB.value = registerC.value;
}

function SUB() {
	FETCH();
	const op = ram[programCounter.value++] & 255;
	programCounter.value &= 255;
	memoryAddressRegister.value = op & 255;
	registerB.value = ram[op] & 255;
	registerC.value = (registerA.value - registerB.value) & 0xFF;
	registerA.value = registerC.value;
}

function SBR() {
	FETCH();
	registerC.value = (registerA.value - registerB.value) & 0xFF;
	registerA.value = registerC.value;
}

function OUT() {
	FETCH();
	registerD.value = registerA.value;
}

function JMP() {
	FETCH();
	programCounter.value = ram[programCounter.value];
}

function JLT() {
	FETCH();
	const op = ram[programCounter.value++];
	if (registerA.value < registerB.value)
		programCounter.value = op;
}

function JIZ() {
	FETCH();
	const op = ram[programCounter.value++];
	if (registerA.value - registerB.value === 0)
		programCounter.value = op;
}

function HLT() {}

//------------------------------------------------------------------------------
// binary mapping
//------------------------------------------------------------------------------
const binaryMap = [
	NOP, HLT, LDA, SEA, SEB, ADD, AWC, SUB, SBR, OUT, STA, STB, JMP, JLT, JIZ, ADR, SWP
];

//
function textToCode() {
	const words = codeEditor.value.replaceAll('\n', ' ').split(' ');
	words.forEach((w, i) => {
		let v = binaryMap.indexOf(NOP);
		switch (w) {
			case 'NOP': v = binaryMap.indexOf(NOP); break;
			case 'LDA': v = binaryMap.indexOf(LDA); break;
			case 'SEA': v = binaryMap.indexOf(SEA); break;
			case 'SEB': v = binaryMap.indexOf(SEB); break;
			case 'STA': v = binaryMap.indexOf(STA); break;
			case 'STB': v = binaryMap.indexOf(STB); break;
			case 'ADD': v = binaryMap.indexOf(ADD); break;
			case 'AWC': v = binaryMap.indexOf(AWC); break;
			case 'SUB': v = binaryMap.indexOf(SUB); break;
			case 'SBR': v = binaryMap.indexOf(SBR); break;
			case 'ADR': v = binaryMap.indexOf(ADR); break;
			case 'SWP': v = binaryMap.indexOf(SWP); break;
			case 'OUT': v = binaryMap.indexOf(OUT); break;
			case 'JMP': v = binaryMap.indexOf(JMP); break;
			case 'JLT': v = binaryMap.indexOf(JLT); break;
			case 'JIZ': v = binaryMap.indexOf(JIZ); break;
			case 'HLT': v = binaryMap.indexOf(HLT); break;
			default: v = Number(w); break;
		}
		ram[i] = v;
	});
	disBinary.value = codeToBinary();
	disOctal.value = codeToOctal();
}

//
function codeToBinary() {
	let s = '';
	ram.forEach(i => {
		switch (typeof i) {
			case 'function': s += toBinaryString(i); break;
			case 'number': s += toBinaryString(i); break;
		}
		s += '\n';
	});
	return s;
}

//
function codeToOctal() {
	let s = '';
	ram.forEach(i => {
		switch (typeof i) {
			case 'function': s += toOctalString(i); break;
			case 'number': s += toOctalString(i); break;
		}
		s += '\n';
	});
	return s;
}

//
function toBinaryString(v) {
	return ''
	+ (1 & v >> 7)
	+ (1 & v >> 6)
	+ (1 & v >> 5)
	+ (1 & v >> 4)
	+ (1 & v >> 3)
	+ (1 & v >> 2)
	+ (1 & v >> 1)
	+ (1 & v);
}

//
function toOctalString(v) {
	return ''
	+ (7 & v >> 6)
	+ (7 & v >> 3)
	+ (7 & v);
}

//------------------------------------------------------------------------------
// GUI buttons
//------------------------------------------------------------------------------

window.runProgram = function runProgram() {
	programCounter.value = 0;
	registerA.value = 0;
	registerB.value = 0;
	registerC.value = 0;
	registerD.value = 0;
	ram.length = 0;
	textToCode();
	paused = false;
}

window.resetProgram = function resetProgram() {
	programCounter.value = 0;
}

let paused = false;
window.togglePause = function togglePause() {
	paused ^= true;
}

window.loadExample = function loadExample(name) {
	codeEditor.value = demos[name];
}


//
runProgram();
let time = performance.now();
function run() {
	if (paused) {
		time = performance.now()
		return;
	}
	let clockSpeed = clockSlider.value;
	// pad end with non-breaking space so that slider doesn't move back and
	// forth as number of digits changes
	clockNumber.textContent = 'Clock Speed: ' + String(clockSpeed).padEnd(3, '\xa0');
	while (performance.now() - time >= 1000 / clockSpeed) {
		time += 1000 / clockSpeed;
		const instruction = binaryMap[ram[programCounter.value]];
		if (typeof instruction === 'function') {
			instruction();
		} else {
			togglePause();
			console.warn({
				'program counter:': programCounter.value,
				'instruction:': instruction,
				'register a:': registerA.value,
				'register b:': registerB.value,
				'register c:': registerC.value
			});
			return;
		}
	}
}

//------------------------------------------------------------------------------
// rendering
//------------------------------------------------------------------------------

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function clear() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resize() {
	if (canvas.width !== display.clientWidth
	|| canvas.height !== display.clientHeight) {
		canvas.width = display.clientWidth;
		canvas.height = display.clientHeight;
	}
}

function drawValueLeds(x, y, v, c) {
	let dx = x + 22 * 7;
	for (let n=0; n<8; n++) {
		ctx.fillStyle = ((v >> n) & 1) ? 'rgb(0,255,0)' : 'rgba(0,255,0,0.2)';
		ctx.beginPath();
		ctx.arc(dx, y, 10, 0, Math.PI * 2);
		ctx.fill();
		dx -= 22;
	}
}

function drawValue(text, x, y, v) {
	drawRoundRect(x-22-20, y-38, 240, 75, 20);
	ctx.font = '16px monospace';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#dadaeb';
	ctx.fillText(text, x+22*3.5, y-20);
	ctx.fillText(v, x+22*3.5, y+30);
	drawValueLeds(x, y, v);
}

function drawRam(text, x, y) {
	drawRoundRect(x-22-20, y-38, 740, 350, 20);
	ctx.font = '16px monospace';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#dadaeb';
	ctx.fillText(text, x+330, y-20);
	ctx.save();
	const scale = 0.42;
	ctx.scale(scale, scale);
	x /= scale;
	y /= scale;
	let dx = x;
	for (let j=0; j<8; j++) {
		let dy = y;
		for (let n=0; n<32; n++) {
			const index = j*32+n;
			drawValueLeds(dx, dy, ram[index]);
			if (index === memoryAddressRegister.value) {
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 3;
				ctx.strokeRect(dx-12, dy-12, 180, 22);
			}
			dy += 22;
		}
		dx += 22*9;
	}
	ctx.restore();
}

/**
 * As per this neat solution: http://jsfiddle.net/robhawkes/gHCJt/
 */
function drawRoundRect(x, y, w, h, r) {
	ctx.fillStyle = '#222233';
	ctx.strokeStyle = '#222233';
	ctx.lineJoin = "round";
	ctx.lineWidth = r;
	ctx.strokeRect(x+(r/2), y+(r/2), w-r, h-r);
	ctx.fillRect(x+(r/2), y+(r/2), w-r, h-r);
}

function draw() {
	resize();
	clear();

	drawValue('Program Counter', 60, 50, programCounter.value);
	drawValue('Flags Register', 60, 130, flagRegister.value);

	drawValue('Register A', 310, 50, registerA.value);
	drawValue('Register B', 310, 130, registerB.value);
	drawValue('Register C', 310, 210, registerC.value);
	drawValue('Display Register', 310, 290, registerD.value);

	drawValue('Memory Address Register', 560, 50, memoryAddressRegister.value);
	drawRam('Memory', 60, 50+80*4);

}

//------------------------------------------------------------------------------
// main
//------------------------------------------------------------------------------
(function main() {
	lineNumbers.scrollTop = codeEditor.scrollTop;
	run();
	draw();
	requestAnimationFrame(main);
})();
