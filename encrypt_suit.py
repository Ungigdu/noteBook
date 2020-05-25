import sys
import qrcode
import hashlib
from os import path
from os import remove
from cryptography.fernet import Fernet
from functools import reduce

def write_key():
    """
    Generates a key and save it into a file
    """
    key = Fernet.generate_key()
    with open("key.key", "wb") as key_file:
        key_file.write(key)

def load_key():
    """
    Loads the key from the current directory named `key.key`
    """
    return open("key.key", "rb").read()

def keyMap(remain):
    if 0 <= remain <= 9:
        return chr(48 + remain)
    if 10 <= remain <= 35:
        return chr(65 + remain - 10)
    if 36 <= remain <= 61:
        return chr(97 + remain - 36)

def recursiveHash(seed,length):
    res = ""
    last = seed
    l = int(length)
    while len(res) < l:
        last = hashlib.sha256(last.encode('utf-8')).hexdigest()
        res += keyMap(int(last,16) % 62)
    return res

if not path.exists("key.key"):
    write_key()

key = load_key()
f = Fernet(key)
message = "some secret message".encode()
encrypted = f.encrypt(message)


def main():
    option = str(sys.argv[1])
    if option == "encrypt":
        message = str(sys.argv[2]).encode()
        encrypted = f.encrypt(message)
        print(encrypted)
    elif option == "keygen" :
        write_key()
    elif option == "decrypt" :
        message = bytes(sys.argv[2], 'utf-8')
        decrypted_message = f.decrypt(message)
        print(decrypted_message)
    elif option == "encrypt_file":
        filePath = str(sys.argv[2])
        with open(filePath, "rb") as text:
            encrypted = f.encrypt(text.read())
            with open(filePath+".encrypted","wb") as encrypted_file:
                encrypted_file.write(encrypted)
                remove(filePath)
    elif option == "decrypt_file":
        filePath = str(sys.argv[2])
        with open(filePath, "rb") as text:
            decrypted_message = f.decrypt(text.read())
            save_name = ""
            if filePath.split(".")[-1]=="encrypted":
                save_name = ".".join(filePath.split(".")[:-1])
            else:
                save_name = filePath + ".decrypted"
            with open(save_name,"wb") as decrypted_file:
                decrypted_file.write(decrypted_message)
                remove(filePath)
    elif option == "decrypt_file_as_message":
        filePath = str(sys.argv[2])
        with open(filePath, "rb") as text:
            decrypted_message = f.decrypt(text.read())
            print(str(decrypted_message,"utf-8"))
    elif option == "pass_gen":
        seed = str(sys.argv[2])
        length = sys.argv[3]
        print(recursiveHash(seed,length))
    elif option == "qr_key":
        img = qrcode.make(key)
        img.save("key.png")

if __name__ == "__main__":
    # execute only if run as a script
    main()