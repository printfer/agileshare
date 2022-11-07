// User input passcode length
const PASSCODE_LENGTH = 4;

// User secret status
class PassStatus {
    #password;
    #roomId;
    #roomSecret;

    constructor() {
        this.updateSecrets(getRandomChar(PASSCODE_LENGTH));
    }

    get password() {
        return this.#password;
    }

    get roomId() {
        return this.#roomId;
    }

    get roomSecret() {
        return this.#roomSecret;
    }

    async updateSecrets(password) {
        this.#password = password;
        this.#roomId = await getRoomId(this.#password);
        this.#roomSecret = await getRoomSecret(this.#password, this.#roomId);
    }

}

const passStatus = new PassStatus();
