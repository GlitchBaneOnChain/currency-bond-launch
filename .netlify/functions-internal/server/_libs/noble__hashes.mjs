import { n as __esmMin } from "../_runtime.mjs";
import { S as split, _ as init__u64, a as sha256$1, b as rotlSH, c as aexists, d as clean, f as createHasher, g as u32, h as toBytes, i as init_sha2, l as anumber, m as swap32IfBE, o as Hash, p as init_utils, s as abytes, u as aoutput, v as rotlBH, x as rotlSL, y as rotlBL } from "./noble__curves+noble__hashes.mjs";
//#region node_modules/@noble/hashes/esm/sha3.js
/** `keccakf1600` internal function, additionally allows to adjust round count. */
function keccakP(s, rounds = 24) {
	const B = /* @__PURE__ */ new Uint32Array(10);
	for (let round = 24 - rounds; round < 24; round++) {
		for (let x = 0; x < 10; x++) B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
		for (let x = 0; x < 10; x += 2) {
			const idx1 = (x + 8) % 10;
			const idx0 = (x + 2) % 10;
			const B0 = B[idx0];
			const B1 = B[idx0 + 1];
			const Th = rotlH(B0, B1, 1) ^ B[idx1];
			const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
			for (let y = 0; y < 50; y += 10) {
				s[x + y] ^= Th;
				s[x + y + 1] ^= Tl;
			}
		}
		let curH = s[2];
		let curL = s[3];
		for (let t = 0; t < 24; t++) {
			const shift = SHA3_ROTL[t];
			const Th = rotlH(curH, curL, shift);
			const Tl = rotlL(curH, curL, shift);
			const PI = SHA3_PI[t];
			curH = s[PI];
			curL = s[PI + 1];
			s[PI] = Th;
			s[PI + 1] = Tl;
		}
		for (let y = 0; y < 50; y += 10) {
			for (let x = 0; x < 10; x++) B[x] = s[y + x];
			for (let x = 0; x < 10; x++) s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
		}
		s[0] ^= SHA3_IOTA_H[round];
		s[1] ^= SHA3_IOTA_L[round];
	}
	clean(B);
}
var _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_PI, SHA3_ROTL, _SHA3_IOTA, IOTAS, SHA3_IOTA_H, SHA3_IOTA_L, rotlH, rotlL, Keccak, gen, keccak_256;
var init_sha3 = __esmMin((() => {
	init__u64();
	init_utils();
	_0n = BigInt(0);
	_1n = BigInt(1);
	_2n = BigInt(2);
	_7n = BigInt(7);
	_256n = BigInt(256);
	_0x71n = BigInt(113);
	SHA3_PI = [];
	SHA3_ROTL = [];
	_SHA3_IOTA = [];
	for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
		[x, y] = [y, (2 * x + 3 * y) % 5];
		SHA3_PI.push(2 * (5 * y + x));
		SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
		let t = _0n;
		for (let j = 0; j < 7; j++) {
			R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
			if (R & _2n) t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
		}
		_SHA3_IOTA.push(t);
	}
	IOTAS = split(_SHA3_IOTA, true);
	SHA3_IOTA_H = IOTAS[0];
	SHA3_IOTA_L = IOTAS[1];
	rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s);
	rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s);
	Keccak = class Keccak extends Hash {
		constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
			super();
			this.pos = 0;
			this.posOut = 0;
			this.finished = false;
			this.destroyed = false;
			this.enableXOF = false;
			this.blockLen = blockLen;
			this.suffix = suffix;
			this.outputLen = outputLen;
			this.enableXOF = enableXOF;
			this.rounds = rounds;
			anumber(outputLen);
			if (!(0 < blockLen && blockLen < 200)) throw new Error("only keccak-f1600 function is supported");
			this.state = /* @__PURE__ */ new Uint8Array(200);
			this.state32 = u32(this.state);
		}
		clone() {
			return this._cloneInto();
		}
		keccak() {
			swap32IfBE(this.state32);
			keccakP(this.state32, this.rounds);
			swap32IfBE(this.state32);
			this.posOut = 0;
			this.pos = 0;
		}
		update(data) {
			aexists(this);
			data = toBytes(data);
			abytes(data);
			const { blockLen, state } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				for (let i = 0; i < take; i++) state[this.pos++] ^= data[pos++];
				if (this.pos === blockLen) this.keccak();
			}
			return this;
		}
		finish() {
			if (this.finished) return;
			this.finished = true;
			const { state, suffix, pos, blockLen } = this;
			state[pos] ^= suffix;
			if ((suffix & 128) !== 0 && pos === blockLen - 1) this.keccak();
			state[blockLen - 1] ^= 128;
			this.keccak();
		}
		writeInto(out) {
			aexists(this, false);
			abytes(out);
			this.finish();
			const bufferOut = this.state;
			const { blockLen } = this;
			for (let pos = 0, len = out.length; pos < len;) {
				if (this.posOut >= blockLen) this.keccak();
				const take = Math.min(blockLen - this.posOut, len - pos);
				out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
				this.posOut += take;
				pos += take;
			}
			return out;
		}
		xofInto(out) {
			if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
			return this.writeInto(out);
		}
		xof(bytes) {
			anumber(bytes);
			return this.xofInto(new Uint8Array(bytes));
		}
		digestInto(out) {
			aoutput(out, this);
			if (this.finished) throw new Error("digest() was already called");
			this.writeInto(out);
			this.destroy();
			return out;
		}
		digest() {
			return this.digestInto(new Uint8Array(this.outputLen));
		}
		destroy() {
			this.destroyed = true;
			clean(this.state);
		}
		_cloneInto(to) {
			const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
			to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
			to.state32.set(this.state32);
			to.pos = this.pos;
			to.posOut = this.posOut;
			to.finished = this.finished;
			to.rounds = rounds;
			to.suffix = suffix;
			to.outputLen = outputLen;
			to.enableXOF = enableXOF;
			to.destroyed = this.destroyed;
			return to;
		}
	};
	gen = (suffix, blockLen, outputLen) => createHasher(() => new Keccak(blockLen, suffix, outputLen));
	keccak_256 = /* @__PURE__ */ (() => gen(1, 136, 256 / 8))();
}));
//#endregion
//#region node_modules/@noble/hashes/esm/sha256.js
var sha256;
var init_sha256 = __esmMin((() => {
	init_sha2();
	sha256 = sha256$1;
}));
//#endregion
export { keccak_256 as i, sha256 as n, init_sha3 as r, init_sha256 as t };
