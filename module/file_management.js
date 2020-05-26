var fs = require('fs');
var utils = require('./utils');
var _crypto = require('./_crypto');

const key_path = "./key/key";
const encrypted_prefix = "./encrypted/";
const encrypted_suffix = ".encrypted";

let _key;

function keyExist(){
    return fs.existsSync(key_path);
}

function getEncryptedPath(name){
    return encrypted_prefix + name + encrypted_suffix;
}

module.exports = {
    keyExist : keyExist,
    genKey : genKey,
    recoverKey : recoverKey,
    allFiles : allFiles,
    encryptFile : encryptFile,
    decryptFile : decryptFile,
    deleteFile : deleteFile,
    keyRecovered : keyRecovered,
    mkDirIfNeeded : mkDirIfNeeded,
}

function mkDirIfNeeded(){
    if(!fs.existsSync(encrypted_prefix)){
        fs.mkdirSync(encrypted_prefix);
    }
    if(!fs.existsSync("./key/")){
        fs.mkdirSync("./key/");
    }
}

function genKey(pass){
    key_string = _crypto.genKey(pass);
    saveKey(key_string);
    recoverKey(pass);
}

function allFiles(){
    return fs.readdirSync(encrypted_prefix).map((x)=>x.split(".")[0]);
}

function saveKey(key){
    fs.writeFileSync(key_path, JSON.stringify(key));
}

function recoverKey(pass){
    protected_key = JSON.parse(fs.readFileSync(key_path));
    key_string = _crypto.recoverKey(pass, protected_key);
    _key = Buffer.from(key_string, "hex");
}

function encryptFile(name, text){
    let encrypted_content = _crypto.encrypt(text, _key);
    fs.writeFileSync(getEncryptedPath(name), JSON.stringify(encrypted_content));
}

function decryptFile(name){
    let encrypted_content = JSON.parse(fs.readFileSync(getEncryptedPath(name)));
    return _crypto.decrypt(encrypted_content, _key);
}

function deleteFile(name){
    fs.unlinkSync(getEncryptedPath(name))
}

function keyRecovered(){
    return _key!=undefined;
}
