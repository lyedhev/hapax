import { globalState } from '../utils/state.js';
import { populateClassTable } from '../grammar.js';
import { retrieveLexicon } from '../lexicon.js';


// Declare common elements
let editMode = false;
let editedId;

const addClassForm = document.getElementById('add_class_form');
const classNameInput = document.getElementById('class_name');
const classAbbInput = document.getElementById('class_abb');
const classModal = document.getElementById('class_modal_box');
const modalTitle = classModal.querySelector('h2');
const modalButton = addClassForm.querySelector('button');



/**
 * Sets up the class modal form.
 */
export function setUpGrammarModal() {
    
    // Listen for when the modal box is requested to activate by clicking on the add class button
    document.getElementById('table_add').addEventListener('click', () => {

        /*[LOG]*/ console.log("[GRAMMAR/MODAL] 'lang_add' was clicked. Activating Language modal box.");

        // Format Grammar modal for adding
        editMode = false;
        editedId = null;
        modalTitle.textContent = "ADD CLASS";
        modalButton.textContent = "S U B M I T";

        classNameInput.value = '';
        classAbbInput.value = '';

        // Make Grammar modal visible
        classModal.classList.add('visible');
    })


    // Listen for when the modal box is requested to close by clicking on the close modal button 
    document.getElementById('class_modal_close').addEventListener('click', () => {

        /*[LOG]*/ console.log("[GRAMMAR/MODAL] 'lang_modal_close' was clicked. Hiding Language modal box.");

        classModal.classList.remove('visible');

    });



    // Listen for when a value submission attempt to the form occurs
    addClassForm.addEventListener('submit', async (e) => {
        
        /*[LOG]*/ console.log("[GRAMMAR/MODAL] Submission initiated.");

        // Manually prevent form from trying to submit to a page
        e.preventDefault();

        // Store inputs if non-null, and break function if any are null
        const name = classNameInput.value.trim();
        const abbreviation = classAbbInput.value.trim();
        const currentLang = globalState.currentLang;

        if (!name || !abbreviation || !currentLang) return;



        try
        { // Try to send the data of the new class to the database via IPC handler

            if (editMode)
            { // If in edit mode, try to edit the class

                /*[LOG]*/ console.log("[GRAMMAR/MODAL] Updating class", name, "of ID", editedId);

                await window.api.updateClass({
                    id: editedId,
                    name: name,
                    abbr: abbreviation
                });

            }
            else
            { // Else if not in edit mode, try to add one instead

                /*[LOG]*/ console.log("[GRAMMAR/MODAL] Adding class:", name);
                
                await window.api.addClass({
                    languageId: currentLang,
                    name,
                    abbreviation
                });
            }
            

            // Reset value of inputs and hide the modal
            classNameInput.value = '';
            classAbbInput.value = '';
            classModal.classList.remove('visible');

            /*[LOG]*/ console.log("[GRAMMAR/MODAL] Class added successfully:", name, abbreviation);
            /*[LOG]*/ console.log("[GRAMMAR/MODAL] Attempting to repopulate Grammar page.");


            // Repopulate Class page with new data
            await populateClassTable(currentLang);
            await retrieveLexicon(currentLang);
        }
        catch (err)
        { // If fails, print an error to the console

            /*[LOG]*/ console.error("[GRAMMAR/MODAL] Couldn't submit class:", err);
        }
    });
}

/**
 * Opens the modal in edit mode for the selected class.
 * @param {*} cls Object containing Class data
 */
export function openEditClassModal(cls) {

    // Reformat for editing
    editMode = true;
    editedId = cls.id;

    modalTitle.textContent = "EDIT CLASS";
    modalButton.textContent = "S A V E";

    classNameInput.value = cls.name;
    classAbbInput.value = cls.abbreviation;

    classModal.classList.add('visible');
}