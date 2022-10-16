# Agileshare

[Agileshare](https://github.com/printfer/Agileshare) is a file-sharing program built with security in mind that is designed to improve the in-person cross-platform file-sharing experience.

:warning: Warning! This program is still developing and contains experimental features. Use it at your own risk.

## Why Agileshare?

Agileshare is an application designed to improve the in-person cross-platform file-sharing experience. Users can share the file by entering the same passcode simultaneously or using a QR code.

You might ask, there are already many file-sharing web app alternatives, why create a new one? Sure there are many similar programs. However, I can't find one good solution that addresses the problem in [WebRTC and Man in the Middle Attacks](https://webrtchacks.com/webrtc-and-man-in-the-middle-attacks/). Moreover, most solutions out there need to use a shared link to connect with other peers or connect within the same local network.

Instead, Agileshare takes a unique approach to creating secure peer-to-peer connections that could mitigate MITM attacks without complex security mechanisms by letting all peers enter the same passcode simultaneously and generate all necessary security variables from it. Agileshare eliminates the hassle of link sharing while maintaining solid security, and all the password derivation and file encryption/decryption happen locally.

# Features

Agileshare is built with the following technologies:

* Vanilla HTML / JavaScript / CSS frontend
* [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) ([PBKDF2](https://en.wikipedia.org/wiki/PBKDF2), [ECDH](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman), [AES-GCM](https://en.wikipedia.org/?title=AES-GCM&redirect=no))
* NodeJS / ExpressJS backend
* PeerJS (WebRTC) / Socket.IO (WebSocket)

Here are some of the key features and expected features:

- [x] WebRTC data transfer
- [x] Peer-to-peer file transfer with multiple peers
- [x] Peer-based file encryption/decryption
- [x] Local file encryption/decryption
- [x] Local key derivation
- [ ] WebSocket as a fallback when WebRTC is not available
- [ ] Connect peer with QR code
- [ ] Show file transfer progress

# Installation

Run the following command to install all the requirements:

```bash
npm install
```

# Usage

To see how this program works, run:

```bash
npm run watch
```

If there is no error, you should be able to access it from [http://127.0.0.1:3000/](http://127.0.0.1:3000/)

# Requirements

Please check [package.json](package.json) for more details

# License

Agileshare is released as free and open source software under the [GPLv3](LICENSE) license.

Agileshare has been developed by [printfer](https://printfer.github.io/) with :heart:
