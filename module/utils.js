module.exports = {
    toHex : toHex,
    fromHex : fromHex,
}

function toHex(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

function fromHex(hexStr) {
    return Buffer.from(hexStr, "hex");
}