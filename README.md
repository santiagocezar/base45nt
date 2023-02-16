# Base45 NT
A Typescript implementation of the Base45 encoding as described in RFC 9285

## Why?

Most Base45 implementations I found used NodeJS `Buffer`, which is not available in browsers. Also I wanted to try to code my own.

## How?

Use the `decode` and `encode` functions defined in the library. They turn `Uint8Array`s into Base45 encoded `string`s and vice versa

```ts
import { encode, decode } from 'base45nt'

const bytes = new Uint8Array([1, 2, 3])
const base45 = encode(bytes)
console.log(base45) // -> "X5030"
const bytesAgain = decode(base45)
console.log(bytesAgain.toString()) // -> "1,2,3"
```
