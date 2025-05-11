import { openLang } from './utils/page_manager.js';
import { globalState } from './utils/state.js';
import { openEditLangModal } from './modals/lang_modal.js';
import { retrieveLexicon } from './lexicon.js';



// Declare common elements
const dropBtn = document.getElementById('drop_btn');
const dropContent = document.getElementById('drop_content');
const dropQ = document.getElementById('drop_queried_content');



/**
 * Sets up listeners for the Language Dropdown menu.
 * Communicates with the preload.js database IPC handlers
 */
export function setUpDropdown() {

    // Listen for the dropdown button to be clicked, and when clicked, handle the selection
    dropBtn.addEventListener('click', handleDropdownClick);

    // Listen for clicks outside of the dropdown
    document.addEventListener('click', (e) => {

        if (!dropBtn.contains(e.target) && !dropContent.contains(e.target))
        { // If the user clicks outside, hide the dropdown and deactivate the button

            dropContent.classList.remove('visible');
            dropContent.classList.add('hidden');
            dropBtn.classList.remove('active');
        }
    });

    // Listen for clicks inside the dropdown's query section
    dropQ.addEventListener('click', (e) => {

        // Get the dataset of the element the user clicked on
        const selectedId = e.target.dataset.id;
        const selectedTitle = e.target.textContent;

        if (selectedId)
        { // If a dataset-id was found, open the associated language

            /*[LOG]*/ console.log("[LANGUAGE] User selected:", selectedId, selectedTitle);

            openLang(selectedId, selectedTitle);
        }
    });
}

/**
 * Handles the user clicking on the Language button on the sidebar.
 */
export async function handleDropdownClick() {
    
    /*[LOG]*/ console.log("[LANGUAGE] Language dropdown button was pressed.");
    
    // If the dropdown contains 'visible', then it is open
    const isOpen = dropContent.classList.contains('visible');

    // Toggle dropdown and source button
    dropContent.classList.toggle('visible');
    dropContent.classList.toggle('hidden');
    dropBtn.classList.toggle('active', !isOpen);


    if (!isOpen)
    { // If the dropdown isn't currently open

        try
        { // Try obtaining data to populate the dropdown

            // Await data to populate dropdown with
            const items = await window.api.getDropdownData();

            /*[LOG]*/ console.log('[LANGUAGE] Received:', items);


            // Define fallback title to assign to later
            let fallbackTitle;

            // Clear container to be populated in preparation for insertion
            dropQ.innerHTML = '';


            items.forEach(item => { // For each item in the list returned, create a new row element

                if (globalState.fallbackLang == 0)
                { // If the fallbackId hasn't been changed yet, set it to the current item's id

                    globalState.fallbackLang = item.id;
                    localStorage.setItem('fallbackLanguageId', globalState.fallbackLang);
                }

                if (!fallbackTitle)
                { // If the name of the fallback language hasn't been set, set it to the current item's name

                    fallbackTitle = item.name;
                }
                

                // Create the wrapper for the selection, edit and delete buttons to be inserted in
                const wrapper = document.createElement('div');
                wrapper.classList.add('dropdown_item_wrapper');


                // | SELECTION BUTTON | --------------------------------
                // Create button & update attributes/properties
                const selectBtn = document.createElement('button');
                selectBtn.classList.add('dropdown_item');
                selectBtn.textContent = item.name;
                selectBtn.dataset.id = item.id;
                
                // Listen for selection button click
                selectBtn.addEventListener('click', () => {

                    /*[LOG]*/ console.log(`[lang_dropdown.js] Selected ${item.name}, ID: ${item.id}`);
                    
                    dropQ.textContent = item.name;

                    // Hide dropdown upon selection and deactivate the dropdown button
                    dropContent.classList.remove('visible');
                    dropContent.classList.add('hidden');
                    dropBtn.classList.remove('active');
                });


                // | EDIT BUTTON | -----------------------------------
                // Create button & update attributes/properties
                const editBtn = document.createElement('button');
                editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                            <path fill-rule="evenodd" d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L6.226 12.25a2.751 2.751 0 0 1-.892.596l-2.047.848a.75.75 0 0 1-.98-.98l.848-2.047a2.75 2.75 0 0 1 .596-.892l7.262-7.261Z" clip-rule="evenodd" />
                            </svg>`;

                editBtn.classList.add('edit_btn');

                // Listen for edit button blick
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    /*[LOG]*/ console.log("[lang_dropdown.js] Editing ", item.name);

                    openEditLangModal(item.id, item.name);
                });


                // | DELETE BUTTON |----------------------------------
                // Create button & update attributes/properties
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                            <path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clip-rule="evenodd" />
                            </svg>`;
                deleteBtn.classList.add('delete_btn');

                // Listen for delete button click
                deleteBtn.addEventListener('click', () => {
                    showDeleteModal('language', item.name, async () => {
                        
                        // When callback is triggered, send the id of the word to the database and await its deletion
                        await window.api.deleteLanguage(item.id);

                        // Set currently selected language to the fallback
                        globalState.currentLang = globalState.fallbackLang;

                        // Then, retrieve the lexicon after deletion for repopulation
                        await handleDropdownClick();
                        await retrieveLexicon(globalState.currentLang);

                        openLang(globalState.fallbackLang, fallbackTitle);
                        
                    })
                })

                // Create wrapper div
                const actions = document.createElement('div');
                actions.classList.add('actions');

                // Load wrapper with child buttons
                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);
                wrapper.appendChild(selectBtn);
                wrapper.appendChild(actions);

                // Insert wrapper into query segment
                dropQ.appendChild(wrapper);
            });
        } catch (err) {
            console.error("[LANGUAGE] Failed to load dropdown items:", err);
        }
    }
}