// Declare common elements
let onDeleteConfirm = null;

const modal = document.getElementById('delete_modal_box');
const message = document.getElementById('delete_modal_message');
const confirmButton = document.getElementById('delete_modal_confirm');
const closeButton = document.getElementById('delete_modal_close');
const header = document.getElementById('delete_modal_heading');


/**
 * Sets up the delete modal form
 */
export function setUpDeleteModal() {
    
    // Listen for the user pressing on the confirm deletion button
    confirmButton.addEventListener('click', () => {
        if (onDeleteConfirm) onDeleteConfirm();
        closeDeleteModal();
    });

    // Listen for user clicking on the close button
    closeButton.addEventListener('click', closeDeleteModal);

    // Make accessible globally
    window.showDeleteModal = (itemType, itemName, confirmCallback) => {
        header.textContent = `DELETE ${itemType.toUpperCase()}`;
        message.innerHTML = `Are you sure you'd like to delete <strong>${itemName}</strong>?`;
        onDeleteConfirm = confirmCallback;
        modal.classList.add('visible');
    };
}

/**
 * Closes the delete modal
 */
function closeDeleteModal() {
    modal.classList.remove('visible');
    onDeleteConfirm = null;
}