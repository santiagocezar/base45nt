'use strict';

const BASE45_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"

const CHARCODE_TO_BASE45: Record<number, number> = {}
const BASE45_TO_CHARCODE: Record<number, number> = {}

for (let i = 0; i < BASE45_ALPHABET.length; i++) {
    CHARCODE_TO_BASE45[BASE45_ALPHABET.charCodeAt(i)] = i
    BASE45_TO_CHARCODE[i] = BASE45_ALPHABET.charCodeAt(i)
}

export class InvalidCharacter extends Error {
    constructor(position: number) {
        super(`character at position ${position} is not valid base45`)
    }
}

export function to_uint16(a: number, b: number): number {
    return (a << 8) + b
}
export function from_uint16(n: number): [number, number] {
    return [n >> 8, n & 255]
}
/**
 * @param n A 16-bit unsigned number (2 bytes)
 * @returns the base45 encoded bytes
 */
export function uint16_to_base45(n: number): [number, number, number] {
    /*
    E = ⌊ N / 45² ⌋
    D = ⌊ (N - E×45²) / 45 ⌋
    C = N - D×45 - E×45²

    also apparently ~~(n) is faster than Math.floor(n)
    */
    const e = ~~(n / (45 * 45))
    n -= e * (45 * 45)
    const d = ~~(n / 45)
    n -= d * 45
    const c = n

    return [c, d, e]
}

/**
 * @param n A 8-bit unsigned number (a byte)
 * @returns the base45 encoded bytes
 */
export function uint8_to_base45(n: number): [number, number] {
    /*
    D = ⌊ N / 45 ⌋
    C = N - D×45
    */
    const d = ~~(n / 45)
    n -= d * 45
    const c = n

    return [c, d]
}

/**
 * @param c the 1st base45 byte
 * @param d the 2nd base45 byte
 * @param e the 3rd base45 byte
 * @returns a 16-bit unsigned number (2 bytes)
 */
export function base45_to_uint16(c: number, d: number, e: number): number {
    return c + d * 45 + e * 45 * 45
}

/**
 * @param c the 1st base45 byte
 * @param d the 2nd base45 byte
 * @returns a 8-bit unsigned number (a byte)
 */
export function base45_to_uint8(c: number, d: number): number {
    return c + d * 45
}

export function encode(bytes: Uint8Array): string {
    const pairs = bytes.byteLength >> 1
    const odd = bytes.byteLength % 2 === 1
    const encodedLength = pairs * 3 + (odd ? 2 : 0)

    const buf = new Uint8Array(encodedLength)

    for (let i = 0; i < pairs; i++) {
        const n = to_uint16(bytes[i * 2], bytes[i * 2 + 1])
        const [c, d, e] = uint16_to_base45(n)
        buf[i * 3] = BASE45_TO_CHARCODE[c]
        buf[i * 3 + 1] = BASE45_TO_CHARCODE[d]
        buf[i * 3 + 2] = BASE45_TO_CHARCODE[e]
    }
    if (odd) {
        const [c, d] = uint8_to_base45(bytes[pairs * 2])
        buf[pairs * 3] = BASE45_TO_CHARCODE[c]
        buf[pairs * 3 + 1] = BASE45_TO_CHARCODE[d]
    }
    return new TextDecoder().decode(buf)
}

export function decode(encoded: string): Uint8Array {
    const trios = Math.floor(encoded.length / 3)
    const remaining = encoded.length % 3 === 2
    const decodedLength = trios * 2 + (remaining ? 1 : 0)

    const buf = new Uint8Array(decodedLength)

    for (let i = 0; i < trios; i++) {
        const c = CHARCODE_TO_BASE45[encoded.charCodeAt(i * 3)]
        const d = CHARCODE_TO_BASE45[encoded.charCodeAt(i * 3 + 1)]
        const e = CHARCODE_TO_BASE45[encoded.charCodeAt(i * 3 + 2)]
        if (c === undefined)
            throw new InvalidCharacter(i * 3);
        if (d === undefined)
            throw new InvalidCharacter(i * 3 + 1);
        if (e === undefined)
            throw new InvalidCharacter(i * 3 + 2);
        const n = base45_to_uint16(c, d, e)
        const [a, b] = from_uint16(n)
        buf[i * 2] = a
        buf[i * 2 + 1] = b
    }
    if (remaining) {
        const c = CHARCODE_TO_BASE45[encoded.charCodeAt(trios * 3)]
        const d = CHARCODE_TO_BASE45[encoded.charCodeAt(trios * 3 + 1)]
        const n = base45_to_uint8(c, d)
        buf[trios * 2] = n
    }
    return buf
}


// function test1() {
//     const n = to_uint16(65, 66)
//     const [c, d, e] = uint16_to_base45(n)
//     console.log([n, c, d, e])
//     console.assert(c === 11 && d === 11 && e === 8)
// }
// const [c, d, e] = uint8_to_base45(n)
// console.log([n, c, d, e])
// console.assert(c === 11 && d === 11 && e === 8)