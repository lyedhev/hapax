import { globalState } from "./utils/state.js";
import { openEditClassModal } from "./modals/grammar_modal.js";
import { retrieveLexicon } from "./lexicon.js";



/**
 * Sets up and handles the processing of input/output on the Sound Change page.
 * Communicates with the preload.js Python IPC handler.
 */
export async function populateClassTable(languageId) {

    /*[LOG]*/ console.log("[GRAMMAR] Populating from languageId:", languageId);

    // Send a language ID via IPC handler and await rows
    const rows = await window.api.getClasses(languageId);

    /*[LOG]*/ console.log("[GRAMMAR] Received rows:", rows);
    

    // Declare and reset section of container reserved for query items
    const q = document.getElementById('table_queried');
    q.innerHTML = '';


    // Declare the icons to be used as edit/delete buttons
    // [to make the formatting in this file look nicer]
    const edit_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" /></svg>`;
    
    const delete_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" /></svg>`;


    // Insert and format HTML elements corresponding to rows
    rows.forEach(cls => {
        const row = document.createElement('tr');
        row.classList.add('table_row');
        row.innerHTML = `
            <td>${cls.name}</td>
            <td>${cls.abbreviation}</td>
            <td>${cls.wordCount}</td>
            <td><button class="class_edit"
                data-id="${cls.id}"
                data-name="${cls.name}"
                data-abb="${cls.abbreviation}">${edit_icon}</button></td>
            <td><button class="class_delete"
                data-id="${cls.id}"
                data-name="${cls.name}"
                data-abb="${cls.abbreviation}">${delete_icon}</button></td>
        `;

        // Insert into HTML
        q.appendChild(row);
    });



    // Listen on every delete button for a click
    document.querySelectorAll('table .class_delete').forEach(button => {
        button.addEventListener('click', () => {

            // When clicked, load the delete modal and pass in the name of the class
            showDeleteModal('class', button.dataset.name, async () => {
                            
                // When callback is triggered, send the id of the class to the database and await its deletion
                await window.api.deleteClass(button.dataset.id);

                // Then, repopulate classes and words after deletion
                await populateClassTable(globalState.currentLang);
                await retrieveLexicon(globalState.currentLang);
            })
            
        });
    });


    // Listen on every edit button for a click
    document.querySelectorAll('table .class_edit').forEach(button => {
        button.addEventListener('click', () => {

            // When clicked, create an object containing all the class's attributes
            const classObj = {
                id: button.dataset.id,
                name: button.dataset.name,
                abbreviation: button.dataset.abb
            };
            
            // And open the class modal in edit mode
            openEditClassModal(classObj);
        });
    });


    // Enable Class add button upon execution
    // [as it's disabled by default]
    document.getElementById('table_add').removeAttribute('disabled');

    /*[LOG]*/ console.log("[GRAMMAR] Updated Grammar page with retrieved content.");
}