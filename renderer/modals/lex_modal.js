import { globalState } from '../utils/state.js';
import { retrieveLexicon } from '../lexicon.js';
import { populateClassTable } from '../grammar.js';

// Declare common elements
let editMode = false;
let editedId;

const wordModal = document.getElementById('word_modal_box');
const wordForm = document.getElementById('word_form');
const cardContainer = document.getElementById('card_container');
const cardAll = document.querySelector('.content#corpus');

const wordNameInput = document.getElementById('word_title');
const wordClassSelect = document.getElementById('word_class');
const wordTranscriptionInput = document.getElementById('word_transcription');
const wordOriginLangInput = document.getElementById('word_origin_lang');
const wordOriginWordInput = document.getElementById('word_origin_word');
const wordDefinitionInput = document.getElementById('word_definition');
const wordModalHeading = document.getElementById('word_modal_heading');



/**
 * Populates the <select> element passed into it with grammar classes
 * @param {*} select \<select\> HTML element
 * @returns 
 */
async function populateClassSelect(select) {

    // Read in the currently selected language, and break function if there isn't one
    const currentLang = globalState.currentLang;
    if (!currentLang) return;

    try
    { // Try to retrieve classes and populate the selector

        // Sends currently selected language and awaits list of classes
        const classes = await window.api.getClasses(currentLang);
        
        /*[LOG]*/ console.log("[LEXICON/MODAL] Received:", classes);


        // Clear <select> and add each class as an option
        select.innerHTML = '';
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.dataset.id = cls.id;
            option.textContent = cls.name;
            select.appendChild(option);
        });

    } catch (err) {
        console.error("[LEXICON/MODAL] Failed to populate class dropdown:", err);
    }
}

/**
 * Sets up the word modal form
 */
export function setUpWordModal() {

    // Listen for any clicks within the card container
    // [necessary because 'lex_add' is a dynamic button and so the listener can't be added upon DOM loading]
    cardAll.addEventListener('click', (event) => {
        
        if (event.target.closest('#lex_add') && event.target.closest('#lex_add').id === 'lex_add')
        { // If the clicked element is 'lex_add' or one if its child elements, show the modal box

            // Load default add properties & settings
            editMode = false;
            editedId = null;

            wordModalHeading.textContent = "ADD WORD";

            wordNameInput.value = '';
            wordTranscriptionInput.value = '';
            wordOriginLangInput.value = '';
            wordOriginWordInput.value = '';
            wordDefinitionInput.value = '';
            wordClassSelect.selectedIndex = 0;



            /*[LOG]*/ console.log("[LEXICON/MODAL] Activating Word modal box.");

            wordModal.classList.add('visible');


            /*[LOG]*/ console.log("[LEXICON/MODAL] Attempting to populate word class selector.");

            populateClassSelect(wordClassSelect);
        }
    });

    
    // Listen for when the modal box is requested to close by clicking on the close modal button 
    document.getElementById('word_modal_close').addEventListener('click', () => {

        /*[LOG]*/ console.log("[LEXICON/MODAL] Hiding Word modal box.");

        wordModal.classList.remove('visible');
    });

    
    // Listen for when a value submission attempt to the form occurs
    wordForm.addEventListener('submit', async (e) => {   
        
        /*[LOG]*/ console.log("[LEXICON/MODAL] Attempting to submit to form.");

        // Manually prevent form from trying to submit to a page
        // [since it doesn't exist, as the app is a single-page application]
        e.preventDefault();

        // Store inputs if non-null, and break function if any are null
        const wordName = wordNameInput.value.trim();
        const wordClass = wordClassSelect.options[wordClassSelect.selectedIndex].dataset.id;
        const wordTranscription = wordTranscriptionInput.value.trim();
        const wordEtymology = `${wordOriginLangInput.value.trim()}|${wordOriginWordInput.value.trim()}`;
        const wordDefinition = wordDefinitionInput.value.split("<br>").filter(line => line.trim() !== '').join("\n");

        const currentLang = globalState.currentLang;

        if (!wordName || !wordDefinition || !wordClass) return;

        /*[LOG]*/ console.log("[LEXICON/MODAL] Validated word to be submitted to language", currentLang);


        try
        { // Try to send the data of the word to the database via IPC handler

            if (editMode && editedId)
            { // If edit mode is active, try to update the word

                await window.api.updateWord({
                    id: editedId,
                    name: wordName,
                    transcription: wordTranscription,
                    etymology: wordEtymology,
                    definition: wordDefinition,
                    classId: wordClass,
                });

            }
            else
            { // Else if it isn't, add the word instead

                await window.api.addWord({
                    name: wordName,
                    transcription: wordTranscription,
                    etymology: wordEtymology,
                    definition: wordDefinition,
                    classId: wordClass,
                  });
            }
        
            // Reset value of inputs and hide the modal
            wordNameInput.value = '';
            wordDefinitionInput.value = '';
            wordModal.classList.remove('visible');

            

            // Repopulate the lexicon with the new word
            await retrieveLexicon(currentLang);
            await populateClassTable(currentLang);

            /*[LOG]*/ console.log("[LEXICON/MODAL] Repopulated Lexicon page.");

        }
        catch (err)
        { // If fails, print an error to the console
            
        /*[LOG]*/ console.error("[LEXICON/MODAL] Couldn't add word:", err);
        }
    });
}

/**
 * Opens the word modal box with an edit function
 */
export async function openEditWordModal(wordData) {
    
    // Internally enable edit mode
    editMode = true;
    editedId = wordData.id;

    // Reset Word modal
    wordModalHeading.textContent = "EDIT WORD";

    wordNameInput.value = '';
    wordTranscriptionInput.value = '';
    wordOriginLangInput.value = '';
    wordOriginWordInput.value = '';
    wordDefinitionInput.value = '';
    wordClassSelect.selectedIndex = 0;


    // Read in data associated with the word
    wordNameInput.value = wordData.name || '';
    wordTranscriptionInput.value = wordData.transcription || '';
    wordDefinitionInput.value = wordData.definition || '';

    // Format the etymology display
    const wordEtymologyInput = wordData.etymology.trim().split('|');
    wordOriginLangInput.value = wordEtymologyInput[0] || '';
    wordOriginWordInput.value = wordEtymologyInput[1] || '';

    // Populate the class selection with all options and select the one that was already selected
    await populateClassSelect(wordClassSelect);
    const matchingOption = wordClassSelect.querySelector(`option[data-id="${wordData.classId}"]`);
    if (matchingOption) matchingOption.selected = true;


    // Make Word modal visible
    wordModal.classList.add('visible');
}