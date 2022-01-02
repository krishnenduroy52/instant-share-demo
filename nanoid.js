let urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

function random(bytes) {
    return crypto.getRandomValues(new Uint8Array(bytes))
}
let customRandom = (alphabet, size, getRandom) => {
    let mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1
    let step = -~((1.6 * mask * size) / alphabet.length)
    return () => {
        let id = ''
        while (true) {
            let bytes = getRandom(step)
            let j = step
            while (j--) {
                id += alphabet[bytes[j] & mask] || ''
                if (id.length === size) return id
            }
        }
    }
}
let customAlphabet = (alphabet, size) => customRandom(alphabet, size, random)
let nanoid = (size = 21) => {
    let id = ''
    let bytes = crypto.getRandomValues(new Uint8Array(size))
    while (size--) {
        let byte = bytes[size] & 63
        if (byte < 36) {
            id += byte.toString(36)
        } else if (byte < 62) {
            id += (byte - 26).toString(36).toUpperCase()
        } else if (byte < 63) {
            id += '_'
        } else {
            id += '-'
        }
    }
    return id
}
// export { nanoid, customAlphabet, customRandom, urlAlphabet, random }