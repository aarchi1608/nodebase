import Cryptr from "cryptr";

const secretKey = process.env.ENCRYPTION_KEY || "nodebase-default-dev-encryption-key-32ch";
const cryptr = new Cryptr(secretKey);

export const encrypt = (text : string) => {
    return cryptr.encrypt(text);
}

export const decrypt = (text : string) => {
    return cryptr.decrypt(text);
}