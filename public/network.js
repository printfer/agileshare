class ConnectionList {

    // Text Display
    textDisplay = document.querySelector("#text-display");

    // Peer Status
    isFirstPeer = true;
    totalPeer = 0;
    #peerList = {};
    #keyPair;

    // File Status
    #uploadCandidate;

    // Signal
    #TYPE_ASK_KEY = 0;
    #TYPE_REPLY_KEY = 1;
    #TYPE_FILE_TRANSFER = 2
    #TYPE_FILE_TRANSFER_INIT = 3;
    #TYPE_FILE_TRANSFER_COMPLETE = 4;

    #modalPopUp = new ModalPopUp();
    #tool = new Tool();

    //constructor() {
    //}

    startConnection() {
        // Update display UI
        pass.hidePass();
        drop.showDrop();
        this.#updatePeerListStatus();

        // Initialize local generated ECDH key pair
        getKeyPair().then((keyPair) => {
            this.addKeyPair(keyPair);
        });

        // Socket.IO
        const socket = io();

        // PeerJS
        // Connect to peer server
        const peer = new Peer(undefined, {
            path: "/peerjs",
            host: "/",
            port: "3001"
        });

        // Get peer id from the server
        peer.on("open", (peerId) => {
            console.log(`[peerjs] My peer id: ${peerId}`);
            socket.emit("join-room", passStatus.roomId, peerId);
        })

        // Get peer connect status from server
        socket.on("peer-connected", (peerId) => {
            console.log(`[socket.io] Connected with peerId: ${peerId}`);
            const conn = peer.connect(peerId);
            this.addOnePeer(peerId, conn);
        })

        // Get peer disconnect status from server
        socket.on("peer-disconnected", (peerId) => {
            console.log(`[socket.io] Disconnected with peerId: ${peerId}`);
            this.removeOnePeer(peerId);
        })

        // Wait peer connection
        peer.on("connection", (conn) => {
            conn.on("open", () => {
                // Receive messages
                const peerId = conn.peer;
                this.addOnePeer(peerId, conn);
            });
        });
    }

    addKeyPair(keyPair) {
        this.#keyPair = keyPair;
    }

    removeOnePeer(id) {
        this.totalPeer -= 1;
        this.#peerList[id].connection.close();
        delete this.#peerList[id];
        this.#updatePeerListStatus();
    }

    addOnePeer(id, conn) {
        this.totalPeer +=1;
        this.#peerList[id] = {
            connection: conn,
            secret: null 
        };
        this.#receiveFromPeer(id);
        this.#updatePeerListStatus();
    }

    // Helper for data sending
    #sendMessageTo(peerId, message) { // peerId needs to already exist in the peerList
        this.#peerList[peerId].connection.send(message);
    }
    #sendMessageToAll(message) {
        for (const peerId in this.#peerList) {
            this.#sendMessageTo(peerId, message);
        }
    }
    async #sendFileToAll() {
        for (const peerId in this.#peerList) {
            // File transfer init notification
            this.#sendMessageTo(peerId, {type: this.#TYPE_FILE_TRANSFER_INIT});

            // File transfer notification
            this.#modalPopUp.updateInfo({
                createContext: [{
                    innerHTML: "<i class=\"fa-solid fa-spinner fa-spin-pulse\"></i> Loading ..."
                }]
            });

            // File encryption
            const sharedSecret = await getSecretKeyFromPair(this.#keyPair.privateKey, this.#peerList[peerId].secret);
            const sharedSecretBuffer = await crypto.subtle.exportKey("raw", sharedSecret);
            const sharedSecretString = bufToHex(sharedSecretBuffer);
            const sharedSecretString2 = await getMessageHashing(sharedSecretString);

            const file = await this.#uploadCandidate.arrayBuffer();
            const fileInfo = JSON.stringify({
                name: this.#uploadCandidate.name,
                type: this.#uploadCandidate.type,
            });

            const [encryptedFile, encryptedFileInfo] = await Promise.all([
                encrypt(file, sharedSecretString, passStatus.roomSecret),
                encrypt(getMessageEncoding(fileInfo), sharedSecretString2, passStatus.roomSecret)
            ]);
            this.#peerList[peerId].connection.send({
                type: this.#TYPE_FILE_TRANSFER,
                file: encryptedFile,
                fileInfo: encryptedFileInfo
            });
        }
    }

    #sendPublicKey() {
        crypto.subtle.exportKey("raw", this.#keyPair.publicKey).then((publicKeyBuffer) => {
            this.#sendMessageToAll({
                type: this.#TYPE_ASK_KEY,
                keyString: bufToHex(publicKeyBuffer)
            })
        });
    }

    // Helper for data receiving 
    #receiveFromPeer(peerId) { //TODO: bad name, change this in the future
        const _conn = this.#peerList[peerId];
        _conn.connection.on("data", async (data) => {
            if (typeof data  === "string") {
                console.log(`[peerjs] Received message: ${data}`);
            } else if (typeof data  === "object") {
                switch (data.type) {
                    case this.#TYPE_FILE_TRANSFER: {
                        // File decryption
                        const sharedSecret = await getSecretKeyFromPair(this.#keyPair.privateKey, this.#peerList[peerId].secret);
                        const sharedSecretBuffer = await crypto.subtle.exportKey("raw", sharedSecret);
                        const sharedSecretString = bufToHex(sharedSecretBuffer);
                        const sharedSecretString2 = await getMessageHashing(sharedSecretString);

                        const [fileBuffer, fileInfoEncode] = await Promise.all([
                            decrypt(data.file, sharedSecretString, passStatus.roomSecret),
                            decrypt(data.fileInfo, sharedSecretString2, passStatus.roomSecret)
                        ]);

                        const fileInfo = JSON.parse(getMessageDecoding(fileInfoEncode));
                        const file = new File([fileBuffer], fileInfo.name, {
                            type: fileInfo.type,
                        });

                        // Download notification
                        this.#modalPopUp.updateInfo({
                            createContext: [{
                                innerHTML: "<b>Do you want to download this file?</b>"
                            },{
                                innerHTML: this.#tool.createThumbnail(file)
                            }],
                            createButton: [{
                                href: URL.createObjectURL(file),
                                download: file.name,
                                textContent: "Download",
                                title: "Click to download: " + file.name
                            },{
                                innerText: "Cancel",
                                title: "Cancel",
                                onclick: () => {this.#modalPopUp.hideModal();}
                            }]
                        });

                        // Download complete notification
                        this.#sendMessageTo(peerId, {type: this.#TYPE_FILE_TRANSFER_COMPLETE});
                        break;
                    }
                    case this.#TYPE_ASK_KEY: {
                        console.log(`[peerjs] Received key from ${peerId}: data.keyString`);
                        const peerPublicKey = await getPublicKeyFrom(hexToBuf(data.keyString));
                        this.#peerList[peerId].secret = peerPublicKey;
                        const publicKeyBuffer = await crypto.subtle.exportKey("raw", this.#keyPair.publicKey)
                        this.#sendMessageTo(peerId, {
                            type: this.#TYPE_REPLY_KEY,
                            keyString: bufToHex(publicKeyBuffer)
                        });
                        break;
                    }
                    case this.#TYPE_REPLY_KEY: {
                        const peerPublicKey = await getPublicKeyFrom(hexToBuf(data.keyString));
                        this.#peerList[peerId].secret = peerPublicKey;

                        this.#modalPopUp.updateInfo({
                            createContext: [{
                                innerHTML: "<b>Do you want to upload this file?</b>"
                            },{
                                innerHTML: this.#tool.createThumbnail(this.#uploadCandidate)
                            }],
                            createButton: [{
                                innerText: "Confirm",
                                title: "Click to upload: " + this.#uploadCandidate.name,
                                onclick: () => {this.#sendFileToAll();}
                            },{
                                innerText: "Cancel",
                                title: "Cancel",
                                onclick: () => {this.#modalPopUp.hideModal();}
                            }]
                        });
                        break;
                    }
                    case this.#TYPE_FILE_TRANSFER_INIT: {
                        this.#modalPopUp.updateInfo({
                            createContext: [{
                                innerHTML: "<i class=\"fa-solid fa-spinner fa-spin-pulse\"></i> Loading ..."
                            }]
                        });
                        break;
                    }
                    case this.#TYPE_FILE_TRANSFER_COMPLETE: {
                        this.#modalPopUp.updateInfo({
                            createContext: [{
                                innerHTML: "<i class=\"fa-solid fa-circle-check\"></i> Upload complete!"
                            }],
                            createButton: [{
                                innerText: "Confirm",
                                title: "Confirm",
                                onclick: () => {this.#modalPopUp.hideModal();}
                            }]
                        });
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        });
    }

    prepareUpload(file) {
        this.#uploadCandidate = file;
        this.#sendPublicKey();
    }

    //#receiveFromServer() {
    //}

    #updatePeerListStatus() {
        switch (this.totalPeer) {
            case 0:
                this.textDisplay.textContent = this.isFirstPeer ?
                    "Waiting for other peer(s) ..." :
                    "No peer in the room! Refresh the page to start."
                drop.disableDrop();
                break;
            case 1:
                this.textDisplay.textContent = `${this.totalPeer} peer currently in the room`
                if (this.isFirstPeer) {
                    drop.enableDrop();
                    this.isFirstPeer = false;
                }
                break;
            default:
                this.textDisplay.textContent = `${this.totalPeer} peers currently in the room`
        }
    }
}

const connectionList = new ConnectionList();
const pass = new Pass(connectionList);
const drop = new Drop(connectionList);
