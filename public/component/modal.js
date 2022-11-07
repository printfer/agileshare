class ModalPopUp {
    modal = document.querySelector(".modal-window");
    modalContent;

    constructor() {
        this.modalContent = document.createElement("div");
        this.modalContent.className = "center modal-content";
        this.modal.appendChild(this.modalContent);
    }

    updateInfo(modalInfo) {
        this.#removeButton();
        this.#removeContext();
        this.#showModal();

        if (modalInfo.createContext) {
            modalInfo.createContext.forEach(context => {
                this.modalContent.appendChild(
                    this.#createContext(context)
                );
            });
        }

        if (modalInfo.createButton) {
            modalInfo.createButton.forEach(button => {
                this.modalContent.appendChild(
                    this.#createButton(button)
                );
            });
        }
    }

    #showModal() {
        this.modal.style.visibility = "visible"; 
        this.modal.style.opacity = "1"; 
        this.modal.style.pointerEvents = "auto"; 
    }

    hideModal() {
        this.modal.style.visibility = "hidden"; 
        this.modal.style.opacity = "0"; 
        this.modal.style.pointerEvents = "none"; 
    }

    #createButton(buttonInfo) {
        const modalOption = document.createElement("a");
        modalOption.className = "button";
        for (const prop in buttonInfo) {
            modalOption[prop] = buttonInfo[prop];
        }
        return modalOption;
    }
    #removeButton() {
        const buttons = this.modalContent.querySelectorAll(".button");
        buttons.forEach(button => {button.remove()});
    }

    #createContext(contextInfo) {
        const modalContext = document.createElement("p");
        modalContext.className = "modal-context";
        for (const prop in contextInfo) {
            modalContext[prop] = contextInfo[prop];
        }
        return modalContext;
    }
    #removeContext() {
        const contexts = this.modalContent.querySelectorAll(".modal-context");
        contexts.forEach(context => {context.remove()});
    }
}
