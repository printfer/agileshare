const pincode_zone = document.querySelector("#pincode_zone");
const pincode_zone_elements = document.querySelectorAll(".pincode_zone_elements");

// Reset to default values
createPincode();
const inputs = document.querySelectorAll(".pincode");
let currentPos = 0;
inputs[currentPos].focus();

// Initialized input form placeholder with passcode
for (let i = 0; i < inputs.length; i++) {
    inputs[i].placeholder = [...my_passcode][i];
}

// Add event listener to input
inputs.forEach((input, key) => {
    input.addEventListener("click", () => {
        inputs[currentPos].focus();
    });
    input.addEventListener("keydown", (event) => {
        if(event.key === 'Backspace' || event.key === 'Delete') {
            if (inputs[currentPos].value) {
                inputs[currentPos].value = '';
            } else if (currentPos !== 0 && !inputs[currentPos].value) {
                currentPos = currentPos - 1;
                inputs[currentPos].value = '';
                inputs[currentPos].focus();
            }
        }
    });
    input.addEventListener("keyup", (event) => {
        if(event.key === 'Enter'){
            updateRoomInfo();
            startConnection();
            updateDisplayUI();
        }
        if (input.value) {
            inputs[currentPos].placeholder = input.value; // Update placeholder in current poistion
            my_passcode = my_passcode.substring(0, currentPos) + input.value + my_passcode.substring(currentPos + 1); // Update passcode in current poistion

            if (key !== (inputs.length - 1)) {
                currentPos = key + 1;
                inputs[currentPos].focus();
            }
            //console.log('current passcode: ' + my_passcode);
            updateRoomInfo();
        }
    });
});

// Add event listener to pincode confirm button
pincode_confirm.onclick = () => {
    updateRoomInfo();
    startConnection();
    updateDisplayUI();
}

function createPincode() {
    let formElement = document.createElement('form');
    formElement.appendChild(document.createTextNode('\n'));
    for (let i = 0; i < PASSCODE_LENGTH; i++) {
        const inputElement = document.createElement('input');
        inputElement.className = 'pincode';
        inputElement.type = 'text';
        inputElement.maxLength = 1;
        formElement.appendChild(inputElement);
        formElement.appendChild(document.createTextNode("\n"));
    }
    pincode_zone.appendChild(formElement);
}

//function removePincode() {
//    while (pincode_zone.firstChild) {
//        pincode_zone.removeChild(pincode_zone.firstChild);
//    }
//}

function updateDisplayUI() {
    pincode_zone.style.display = "none";
    pincode_zone_elements.forEach((element) => {element.style.display = "none"});
    drop_zone.style.display = "block";
    drop_zone_elements.forEach((element) => {element.style.display = "block"});
}

function updateRoomInfo() {
    getRoomId(my_passcode).then((roomId) => {
        my_room_id = roomId;
    })
    getRoomSecert(my_passcode, my_room_id).then((roomSecert) => {
        my_room_secret = roomSecert;
    })
}

// QR Code
//let qrcode = new QRCode(document.getElementById("qrcode"), my_passcode);
//
//function updateQRCode(message) {
//    qrcode.clear(); // clear the code.
//    qrcode.makeCode(message); // make another code.
//}

// Crypto
