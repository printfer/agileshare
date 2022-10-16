const drop_zone = document.querySelector("#drop_zone");
drop_zone.style.display = "none";
const drop_zone_elements = document.querySelectorAll(".drop_zone_elements");
drop_zone_elements.forEach((element) => {element.style.display = "none"});

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {

    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
            prepareUpload(inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone__over");
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone__over");
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length &&
            !(!e.dataTransfer.files[0].type && e.dataTransfer.files[0].size % 4096 == 0)) { // Prevent loading directory
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            prepareUpload(e.dataTransfer.files[0]);
        }
        dropZoneElement.classList.remove("drop-zone__over");
    });
});

upload_confirm.onclick = () => {
    sendFileToAll();
}

function updateThumbnail(dropZoneElement, file) {

    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

    // Remove prompt if it already exists
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
    }

    // Create thumbnail element
    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }
    thumbnailElement.dataset.label = file.name;

    // Show thumbnail for image files
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}

function prepareUpload(file) {
    my_upload_candidate = file;
    sendPublicKey();
}
