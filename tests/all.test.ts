import * as b45 from ".."

test("converting to uint16 and back", () => {
    const a = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    const n = b45.to_uint16(a, b)
    const [a2, b2] = b45.from_uint16(n)
    expect(b45.to_uint16(65, 66)).toBe(16706)
    expect(b45.from_uint16(16706)).toEqual([65, 66])
    expect(a === a2 && b === b2).toBe(true)
})
test("encoding a uint16", () => {
    expect(b45.uint16_to_base45(b45.to_uint16(72, 101))).toEqual([38, 6, 9])
})
test("encoding a uint8", () => {
    expect(b45.uint8_to_base45(33)).toEqual([33, 0])
    expect(b45.uint8_to_base45(53)).toEqual([8, 1])
})
test("encoding some bytes", () => {
    expect(b45.encode(
        new Uint8Array([65, 66])
    )).toBe("BB8")
    expect(b45.encode(
        //@ts-expect-error on the browser, but this is node
        new TextEncoder('ascii').encode("Hello!!")
    )).toBe("%69 VD92EX0")
    expect(b45.encode(
        new TextEncoder().encode("Hello!!")
    )).toBe("%69 VD92EX0")
    expect(b45.encode(
        new Uint8Array([98, 97, 115,
            101, 45, 52, 53])
    )).toBe("UJCLQE7W581")
})
test("decoding some bytes", () => {
    expect(b45.decode("BB8")).toEqual(new Uint8Array([65, 66]))
    expect(b45.decode("%69 VD92EX0"))
        //@ts-expect-error: 'ascii' is not a valid value on the browser, but this is node though
        .toEqual(new TextEncoder('ascii').encode("Hello!!"))
    expect(b45.decode("UJCLQE7W581"))
        .toEqual(new Uint8Array([98, 97, 115,
            101, 45, 52, 53]))
    expect(() => b45.decode("invalid lol"))
        .toThrow()
})