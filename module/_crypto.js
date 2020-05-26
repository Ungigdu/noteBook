const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const utils = require('./utils')

module.exports = {
  genKey: genKey,
  recoverKey : recoverKey,
  encrypt: encrypt,
  decrypt: decrypt
}

//create a pass gen aes key to protect random generated aes key
function genKey(password) {
  let real_key = crypto.randomBytes(32);
  let pass_genKey = crypto.scryptSync(password, 'salt', 32);
  return encrypt(utils.toHex(real_key), pass_genKey);
}

function recoverKey(password, encrypted_key) {
  let pass_genKey = crypto.scryptSync(password, 'salt', 32);
  return decrypt(encrypted_key, pass_genKey)
}

function encrypt(text, key) {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text, key) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc',key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}