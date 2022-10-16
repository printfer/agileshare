const PLUS_ONE = 1;
const MINUS_ONE = -1;
const peerList = {}; // List of DataConnection from PeerJS
let peerListTotal = 0;

function startConnection() {
    roomId = my_room_id;

    // Initialize key pair
    getKeyPair().then((keyPair) => {
        my_keypair = keyPair; 
    });

    // Socket.IO
    const socket = io();

    // PeerJS
    // Connect to peer server
    const peer = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '3001'
    });

    // Get peer id from the server
    peer.on('open', (peerId) => {
        console.log('[peerjs] My peer id: ' + peerId);
        socket.emit('join-room', roomId, peerId);
    })

    // Get peer connect status from server
    socket.on('peer-connected', (peerId) => {
        console.log('[socket.io] Connected with peerId: ' + peerId);
        //const conn = peer.connect(peerId, {metadata: {"id": "test"}});
        const conn = peer.connect(peerId);
        const infoObject = {connection: conn, secret: null};
        peerList[peerId] = infoObject;
        updatePeerListTotal(PLUS_ONE);
        receiveDataFrom(conn);
    })

    // Get peer disconnect status from server
    socket.on('peer-disconnected', (peerId) => {
        console.log('[socket.io] Disconnected with peerId: ' + peerId);
        peerList[peerId].connection.close();
        delete peerList[peerId];
        updatePeerListTotal(MINUS_ONE);
    })

    // Wait peer connection
    peer.on('connection', (conn) => {
        conn.on('open', () => {
            // Receive messages
            //console.log("[peerjs] Received metadataId: " + conn.metadata.id);
            const peerId = conn.peer;
            const infoObject = {connection: conn, secret: null};
            peerList[peerId] = infoObject;
            updatePeerListTotal(PLUS_ONE);
            receiveDataFrom(conn);
        });
    });
}

// Helper for data sending
function sendMessageTo(peerId, message) { // peerId needs to already exist in the peerList
    peerList[peerId].connection.send(message);
}
function sendMessageToAll(message) {
    for (const peerId in peerList) {
        sendMessageTo(peerId, message);
    }
}
function sendKeyTo(peerId, keyType, publicKey) {
    const keyObject = {
        type: keyType,
        keyString: publicKey
    };
    peerList[peerId].connection.send(keyObject);
}
function sendKeyToAll(publicKey) {
    for (const peerId in peerList) {
        sendKeyTo(peerId, TYPE_ASK_KEY, publicKey);
    }
}
async function sendFileToAll() {
    for (const peerId in peerList) {
        sendMessageTo(peerId, INIT_FILE_TRANSFER);

        const sharedSecert = await getSecretKeyFromPair(my_keypair.privateKey, peerList[peerId].secret);
        const sharedSecertBuffer = await crypto.subtle.exportKey("raw", sharedSecert);
        const sharedSecertString = buf2hex(sharedSecertBuffer);
        const sharedSecertString2 = await getMessageHashing(sharedSecertString);

        const file = await my_upload_candidate.arrayBuffer();

        const [encryptedFile, encryptedFilename] = await Promise.all([
            encrypt(file, sharedSecertString, my_room_secret),
            encrypt(getMessageEncoding(my_upload_candidate.name), sharedSecertString2, my_room_secret)
        ]);
        //const encryptedFile = await encrypt(file, sharedSecertString, my_room_secret);
        //const encryptedFilename = await encrypt(getMessageEncoding(my_upload_candidate.name), sharedSecertString, my_room_secret);
        peerList[peerId].connection.send({
            type: "file",
            file: encryptedFile,
            filename: encryptedFilename
        });
    }
}

// Helper for data receiving 
async function receiveDataFrom(conn) {
    conn.on('data', async (data) => {
        const peerId = conn.peer;
        if (typeof data === "number") {
            switch (data) {
                case INIT_FILE_TRANSFER:
                    download_confirm.firstChild.innerHTML = '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Loading ...';
                    break;
                default:
            }
        } else if (typeof data  === "string") {
            console.log('[peerjs] Received message: ', data);
        } else if (typeof data  === "object") {
            if (data.type === "file") {
                const sharedSecert = await getSecretKeyFromPair(my_keypair.privateKey, peerList[peerId].secret);
                const sharedSecertBuffer = await crypto.subtle.exportKey("raw", sharedSecert);
                const sharedSecertString = buf2hex(sharedSecertBuffer);
                const sharedSecertString2 = await getMessageHashing(sharedSecertString);
                //console.log('Shared Secert: ' + sharedSecertString));

                const [fileBuffer, filename] = await Promise.all([
                    decrypt(data.file, sharedSecertString, my_room_secret),
                    decrypt(data.filename, sharedSecertString2, my_room_secret)
                ]);

                const file = new Blob([fileBuffer]);
                const filenameString = getMessageDecoding(filename)
                download_confirm.href = URL.createObjectURL(file)
                download_confirm.download = filenameString;
                //download_confirm.click(); // Auto download
                download_confirm.firstChild.textContent = "Download File";
                download_confirm.firstChild.title = "Click to download: " + filenameString;
                download_confirm.firstChild.disabled = false;
            } else if (data.type === TYPE_ASK_KEY) {
                console.log("[peerjs] Received key from " + conn.peer + ": " + data.keyString);
                const peerPublicKey = await getPublicKeyFrom(hex2buf(data.keyString));
                peerList[conn.peer].secret = peerPublicKey;
                const publicKeyBuffer = await crypto.subtle.exportKey("raw", my_keypair.publicKey)
                sendKeyTo(conn.peer, TYPE_REPLY_KEY, buf2hex(publicKeyBuffer));
            } else if (data.type === TYPE_REPLY_KEY) {
                const peerPublicKey = await getPublicKeyFrom(hex2buf(data.keyString));
                peerList[conn.peer].secret = peerPublicKey;
                upload_confirm.firstChild.disabled = false;
            }
        }
    });
}

function sendPublicKey() {
    crypto.subtle.exportKey("raw", my_keypair.publicKey).then((publicKeyBuffer) => {
        sendKeyToAll(buf2hex(publicKeyBuffer))
    });
}

function updatePeerListTotal(number) {
    peerListTotal += number;
    //console.log(peerListTotal);
    switch (peerListTotal) {
        case 0:
            drop_zone_display.textContent = 'No peer in the room! Refresh the page to start.'
            break;
        case 1:
            drop_zone_display.textContent = peerListTotal + ' peer currently in the room'
            break;
        default:
            drop_zone_display.textContent = peerListTotal + ' peers currently in the room'
    }
}
