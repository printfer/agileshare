my_passcode = getRandomChar(PASSCODE_LENGTH); // Initialize passcode with a randomly generated 6 digits hex string (CSPRNG)
getRoomId(my_passcode).then((roomId) => { // Initialize room id with passcode
    my_room_id = roomId
}); 

// String to ArrayBuffer
function getMessageEncoding(message) {
    const encoder = new TextEncoder();
    return encoder.encode(message);
}

// ArrayBuffer to String
function getMessageDecoding(message) {
    let decoder = new TextDecoder(); // default 'utf-8' or 'utf8'
    return decoder.decode(message);
}

function getKeyMaterial(password) {
    const enc = new TextEncoder();
    return window.crypto.subtle.importKey(
        "raw", 
        enc.encode(password), 
        {name: "PBKDF2"}, 
        false, 
        ["deriveBits", "deriveKey"]
    );
}

function getKey(keyMaterial, salt) {
    return window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            "salt": salt, 
            "iterations": 100000,
            "hash": "SHA-256"
        },
        keyMaterial,
        { "name": "AES-GCM", "length": 256},
        true,
        [ "encrypt", "decrypt" ]
    );
}

function getKeyPair() {
    return  window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: ECDH_CURVE
        },
        false,
        ["deriveKey"]
    );

}

function getSecretKeyFromPair(privateKey, publicKey) {
    return window.crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey
        },
        privateKey,
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

function getPublicKeyFrom(publicKey) {
    return window.crypto.subtle.importKey(
        "raw",
        publicKey,
        {
            name: "ECDH",
            namedCurve: ECDH_CURVE
        },
        false,
        []
    );
}

async function encrypt(rawData, key1, key2) {
    const keyMaterial1 = await getKeyMaterial(key1 + key2);
    const salt1 = getMessageEncoding(key2 + key1);
    const key = await getKey(keyMaterial1, salt1);

    const keyMaterial2 = await getKeyMaterial(key2 + key1);
    const salt2 = getMessageEncoding(key1 + key2);
    const ivEncode = await getKey(keyMaterial2, salt2);
    const iv = await crypto.subtle.exportKey("raw", ivEncode);

    const encryptedData = await window.crypto.subtle.encrypt(
        {
            "name": "AES-GCM",
            "iv": iv
        },
        key,
        rawData
    );

    return encryptedData;
}

async function decrypt(encryptedData, key1, key2) {
    const keyMaterial1 = await getKeyMaterial(key1 + key2);
    const salt1 = getMessageEncoding(key2 + key1);
    const key = await getKey(keyMaterial1, salt1);

    const keyMaterial2 = await getKeyMaterial(key2 + key1);
    const salt2 = getMessageEncoding(key1 + key2);
    const ivEncode = await getKey(keyMaterial2, salt2);
    const iv = await crypto.subtle.exportKey("raw", ivEncode);

    try {
        let decrypted = await window.crypto.subtle.decrypt(
            {
                "name": "AES-GCM",
                "iv": iv
            },
            key,
            encryptedData
        );

        let dec = new TextDecoder();
        return decrypted;
    } catch (e) {
        console.error('Decryption error');
    }
}

function getRandomChar(length) {
    let result = '';
    // Better alternative: const characters = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (const num of array) {
        result += characters.charAt(num % characters.length);
    }
    return result;
}

// ArrayBuffer to Hex
// buffer: ArrayBuffer
function buf2hex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

// Hex to ArrayBuffer
// hex: hex string
function hex2buf(hex) {
    let buffer = new ArrayBuffer(hex.length / 2);
    let array = new Uint8Array(buffer);
    let k = 0;
    for (let i = 0; i < hex.length; i +=2 ) {
        array[k] = parseInt(hex[i] + hex[i+1], 16);
        k++;
    }
    return buffer;
}

// Get current time in minutes
function getCurrentTime() {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ':' + today.getMinutes(); //  + ':' + today.getSeconds();
    return date + ' ' + time;
}

async function getMessageHashing(message) {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    return crypto.subtle.digest('SHA-256', msgUint8); // hash the message
}

// Generate the room id for people with the same password and enter it at the same time.
// password: str
async function getRoomId(password) {
    const currentTime = getCurrentTime();
    console.log('[Info] Current Time: ' + currentTime)
    const [keyMaterial, salt] = await Promise.all([
        getKeyMaterial(password),
        getMessageHashing(currentTime)
    ]);
    const key = await getKey(keyMaterial, salt);
    const exportKey = await crypto.subtle.exportKey("raw", key);

    console.log('[Info] Current Room ID: ' + buf2hex(exportKey));
    return buf2hex(exportKey);
}

// Generate the room secret using passcode
// password: str
async function getRoomSecert(password, roomId) {
    const keyMaterial = await getKeyMaterial(password);
    const salt = getMessageEncoding(roomId);
    const key = await getKey(keyMaterial, salt);
    const exportKey = await crypto.subtle.exportKey("raw", key);

    console.log('[Info] Current Room Secert: ' + buf2hex(exportKey));
    return buf2hex(exportKey);
}
