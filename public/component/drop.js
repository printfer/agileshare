class Drop {
    drop = document.querySelector("#drop");

    constructor(connectionList) {
        this._connectionList = connectionList;
        this.#createDrop();
        this.#hideDrop();
    }

    showDrop() {
        this.drop.style.display = "block";
    }

    #hideDrop() {
        this.drop.style.display = "none";
    }

    enableDrop() {
        this.#addDropEventListener();
        this.dropZone.style.cursor = "pointer";
    }

    disableDrop() {
        this.#removeDropEventListener();
        this.dropZone.style.cursor = "not-allowed";
    }

    #createDrop() {
        this.dropZone = document.createElement("div");
        this.dropZone.className = "center drop-zone";
        this.drop.appendChild(this.dropZone);

        this.dropZonePrompt = document.createElement("span");
        this.dropZonePrompt.innerText = "Drop file here or click to upload";
        this.dropZone.appendChild(this.dropZonePrompt);

        this.dropZoneInput = document.createElement("input");
        this.dropZoneInput.type = "file";
        this.dropZoneInput.name = "myFile";
        this.dropZoneInput.className = "drop-zone__input";
        this.dropZone.appendChild(this.dropZoneInput);
    }

    #addDropEventListener() {
        this.dropZone.addEventListener("click", () => {
            this.dropZoneInput.click();
        });

        this.dropZoneInput.addEventListener("change", () => {
            if (this.dropZoneInput.files.length) {
                this._connectionList.prepareUpload(this.dropZoneInput.files[0]);
            }
        });

        this.dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.dropZone.classList.add("drop-zone__over");
        });

        ["dragleave", "dragend"].forEach((type) => {
            this.dropZone.addEventListener(type, () => {
                this.dropZone.classList.remove("drop-zone__over");
            });
        });

        this.dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length &&
                !(!e.dataTransfer.files[0].type && e.dataTransfer.files[0].size % 4096 === 0)) { // Prevent loading directory
                this.dropZoneInput.files = e.dataTransfer.files;
                this._connectionList.prepareUpload(e.dataTransfer.files[0]);
            }
            this.dropZone.classList.remove("drop-zone__over");
        });
    }

    #removeDropEventListener() {
        while (this.drop.firstChild) {
            this.drop.removeChild(this.drop.firstChild);
        }
        this.#createDrop();
    }
}
