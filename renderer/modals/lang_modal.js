import { handleDropdownClick } from "../lang_dropdown.js";
import { openLang } from "../utils/page_manager.js";



// Declare common elements
let editMode = false;
let editedId;

const addLangForm = document.getElementById('add_lang_form');
const languageInput = document.getElementById('lang_name');
const langModal = document.getElementById('lang_modal_box');
const modalTitle = langModal.querySelector('h2');
const submitButton = langModal.querySelector('.modal_submit');



/**
 * Sets up the language modal form.
 */
export function setUpLanguageModal() {

    // Listen for when the modal box is requested to activate by clicking on the add language button
    document.getElementById('lang_add').addEventListener('click', () => {

        /*[LOG]*/ console.log("[LANGUAGE/MODAL] Activating modal box.");

        // Reformat Language modal
        editMode = false;
        editedId = null;

        modalTitle.textContent = 'ADD LANGUAGE';
        submitButton.textContent = 'S U B M I T';
        languageInput.value = '';

        // Make Language modal visible
        langModal.classList.add('visible');
    })


    // Listen for when the modal box is requested to close by clicking on the close modal button 
    document.getElementById('lang_modal_close').addEventListener('click', () => {

        /*[LOG]*/ console.log("[LANGUAGE/MODAL] Hiding Language modal box.");

        langModal.classList.remove('visible');

    });


    // Listen for when a value submission attempt to the form occurs
    addLangForm.addEventListener('submit', async (e) => {

        /*[LOG]*/ console.log("[LANGUAGE/MODAL] Submission initiated.", );

        // Manually prevent form from trying to submit to a page
        e.preventDefault();

        // Store input if non-null, and break function if null
        const langName = languageInput.value.trim();
        if (!langName) return;

        try
        { // Try to send name of the language to the database via IPC handler

            if (editMode)
            { // If in edit mode, try to edit the language

                /*[LOG]*/ console.log("[LANGUAGE/MODAL] Updating language with ID", editedId, "to", langName);

                // Send the data to the database and await completion, then refresh dropdown
                await window.api.updateLanguage(editedId, langName);
                await handleDropdownClick();

                // Change the active language to the one given
                openLang(editedId, langName);
            }
            else
            { // Else, try to add a new language

                // Send the data to the database and await completion
                await window.api.addLanguage(langName);
                
                /*[LOG]*/ console.log("[LANGUAGE/MODAL] Adding language:", langName);
            }
            
            // Reset modal
            languageInput.value = '';
            langModal.classList.remove('visible');
        }
        catch (err)
        { // If fails, print an error to the console
                        
            /*[LOG]*/ console.error("[LANGUAGE/MODAL] Couldn't process request:", err);
        }
    });
}

/**
 * Opens the modal in edit mode for the selected language.
 * @param {number} langId - The ID of the language to edit.
 * @param {string} langName - The current name of the language.
 */
export function openEditLangModal(langId, langName) {

    // Reformat Language modal for editing
    editMode = true;
    editedId = langId;

    modalTitle.textContent = 'EDIT LANGUAGE';
    submitButton.textContent = 'S A V E';
    languageInput.value = langName;

    langModal.classList.add('visible');
}