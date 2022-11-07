class Tool {
    createThumbnail(file) {
        if (file.type.startsWith("image/")) {
            return this.#createThumbnailHTML("fa-file-image", file)
        }
        if (file.type.startsWith("video/")) {
            return this.#createThumbnailHTML("fa-file-video", file)
        }
        return this.#createThumbnailHTML("fa-file", file);
    }
    
    #createThumbnailHTML(iconType, file) {
        return `<i class="fa-solid ${iconType} modal-thumbnail"></i><br/> ${file.name}`;
    }
}
