class Pass {
    pincodeZone = document.querySelector("#pincode-zone");
    passOptionZone = document.querySelectorAll(".pass-option-zone");
    pincodeConfirm = document.querySelector("#pincode-confirm");

    currentPasscode = passStatus.password;

    constructor(connectionList) {
        this._connectionList = connectionList;

        // Reset to default values
        this.#createPincode();
        const inputs = document.querySelectorAll(".pincode");
        let currentPos = 0;
        inputs[currentPos].focus();

        // Initialized input form placeholder with passcode
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].placeholder = [...this.currentPasscode][i];
        }

        // Add event listener to input
        inputs.forEach((input, key) => {
            input.addEventListener("click", () => {
                inputs[currentPos].focus();
            });
            input.addEventListener("keydown", (event) => {
                if(event.key === "Backspace" || event.key === "Delete") {
                    if (inputs[currentPos].value) {
                        inputs[currentPos].value = "";
                    } else if (currentPos !== 0 && !inputs[currentPos].value) {
                        currentPos = currentPos - 1;
                        inputs[currentPos].value = "";
                        inputs[currentPos].focus();
                    }
                }
            });
            input.addEventListener("keyup", (event) => {
                if(event.key === "Enter"){
                    passStatus.updateSecrets(this.currentPasscode).then(() => {
                        this._connectionList.startConnection();
                    });
                }
                if (input.value) {
                    inputs[currentPos].placeholder = input.value; // Update placeholder in current poistion
                    this.currentPasscode = this.currentPasscode.substring(0, currentPos) + input.value + this.currentPasscode.substring(currentPos + 1); // Update passcode in current poistion

                    if (key !== (inputs.length - 1)) {
                        currentPos = key + 1;
                        inputs[currentPos].focus();
                    }
                    //console.log(`current passcode: ${this.currentPasscode}`);
                }
            });
        });

        // Add event listener to pincode confirm button
        this.pincodeConfirm.onclick = () => {
            passStatus.updateSecrets(this.currentPasscode).then(() => {
                this._connectionList.startConnection();
            });
        }
    }

    #createPincode() {
        let formElement = document.createElement("form");
        formElement.appendChild(document.createTextNode("\n"));
        for (let i = 0; i < PASSCODE_LENGTH; i++) {
            const inputElement = document.createElement("input");
            inputElement.className = "pincode";
            inputElement.type = "text";
            inputElement.maxLength = 1;
            formElement.appendChild(inputElement);
            formElement.appendChild(document.createTextNode("\n"));
        }
        this.pincodeZone.appendChild(formElement);
    }

    #showPass() {
        this.pincodeZone.style.display = "block";
        this.passOptionZone.forEach((element) => {element.style.display = "block"});
    }

    hidePass() {
        this.pincodeZone.style.display = "none";
        this.passOptionZone.forEach((element) => {element.style.display = "none"});
    }

    //function removePincode() {
    //    while (this.pincodeZone.firstChild) {
    //        this.pincodeZone.removeChild(this.pincodeZone.firstChild);
    //    }
    //}

    // QR Code
    //let qrcode = new QRCode(document.getElementById("qrcode"), passStatus.password);
    //
    //function updateQRCode(message) {
    //    qrcode.clear(); // clear the code.
    //    qrcode.makeCode(message); // make another code.
    //}
}
