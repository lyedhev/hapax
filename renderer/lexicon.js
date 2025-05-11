import { openEditWordModal } from "./modals/lex_modal.js";
import { globalState } from "./utils/state.js";



// Define common elements
const contentBox = document.querySelector('.content#corpus');
const cardContainer = document.getElementById('card_container');
const searchInput = document.getElementById('lex_search');

// Word list variable
let wordList = [];



/**
 * Retrieves the lexicon's words as objects via IPC handler
 * @param {*} languageId 
 */
export async function retrieveLexicon(languageId) {

    try
    { // Try obtaining data to populate the word list
        
        /*[LOG]*/ console.log("[LEXICON] Retrieving lexicon from languageId:", languageId);


        // Send a language ID via IPC handler and await entries
        wordList = await window.api.getWords(languageId);

        /*[LOG]*/ console.log("[LEXICON] Received lexicon:", wordList);


        // Populate the lexicon page
        populateLexicon(wordList);
    }
    catch (err)
    {
        /*[LOG]*/ console.error('[LEXICON] Error loading lexicon:', err);
    }
}

/**
 * Sets up the Lexicon page search bar-related listeners
 */
export function setUpLexicon() {

    // Listen for the search bar being updated
    searchInput.addEventListener('input', () => {
        
        // Take the current text value converted to lowercase as the search key
        const key = searchInput.value.toLowerCase();
        
        // Filter the current word list against the key
        const filteredList = wordList.filter(word => 
            word.name.toLowerCase().includes(key)
        );
        

        // Re-render the cards on the Lexicon page
        populateLexicon(filteredList);
    });
}

/**
 * Takes a given list of words and renders them on the Lexicon page
 */
function populateLexicon(wordList) {

    // Clear the card container
    cardContainer.innerHTML = '';

    if (wordList.length != 0)
    { // As long as any words have been retrieved, build a card to display each

        wordList.forEach((word, index) => {

            // Instantiate element
            const card = document.createElement('div');
            card.classList.add('card');


            // Split the etymology into two segments: language of origin, and word of origin
            let etymDisplay;
            const [originLang, originWord] = word.etymology.split("|");


            // Change etymology display style depending on which segments are present
            if (originLang && originWord) {
                etymDisplay = `from ${originLang}, <span style="font-weight: bold">${originWord}</span>`;
            } else if (originWord) {
                etymDisplay = `from <span style="font-weight: bold">${originWord}</span>`;
            } else {
                etymDisplay = "of unknown origin";
            }



            // Insert card format
            card.innerHTML = `
                <div class="card_header">
                    <div class="card_actions">
                        <button class="word_edit_btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                            <path fill-rule="evenodd" d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L6.226 12.25a2.751 2.751 0 0 1-.892.596l-2.047.848a.75.75 0 0 1-.98-.98l.848-2.047a2.75 2.75 0 0 1 .596-.892l7.262-7.261Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <button class="word_delete_btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                            <path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <h1>${word.name}</h1>
                    <h4>
                        <span style="font-weight: bold">${word.className.toUpperCase()}</span> | 
                        <span style="font-weight: lighter">${word.transcription || 'No transcription recorded'}</span>
                    </h4>
                </div>
                <div class="card_band">${etymDisplay}</div>
                <div class="card_definition_content">${word.definition || 'No definition provided'}</div>
            `;



            if (index === 0)
            { // If the card is the first element in the word list
                
                // Create a variant card that reformats the add button
                // And wrap both the card and the add button in the same div
                const firstCardVariant = document.createElement('div');
                firstCardVariant.classList.add('first_card_container');


                // Construct the add button variant
                const cardAdd = document.createElement('button');
                cardAdd.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                </svg>
                `;
                cardAdd.classList.add('lex_add');
                cardAdd.id = 'lex_add';


                // Class-wise define this card as 'first_card' instead of 'card'
                card.classList.add('first_card');
                card.classList.remove('card');


                // Construct container div
                firstCardVariant.appendChild(cardAdd);
                firstCardVariant.appendChild(card);

                // Insert into HTML
                cardContainer.appendChild(firstCardVariant);
            }
            else
            { // Else, proceed normally

                // Insert into HTML
                cardContainer.appendChild(card);
            }



            // Define action buttons (edit & delete)
            const editBtn = card.querySelector('.word_edit_btn');
            const deleteBtn = card.querySelector('.word_delete_btn');

            // Listen for a click on the edit button
            editBtn.addEventListener('click', () => {

                // Open the modal in edit mode, and pass in data
                openEditWordModal({
                    id: word.id,
                    name: word.name,
                    transcription: word.transcription,
                    etymology: word.etymology,
                    definition: word.definition,
                    classId: word.classId
                });
            });

            // Listen for a click on the delete button
            deleteBtn.addEventListener('click', () => {

                // Open the delete modal, and pass in data
                showDeleteModal('word', word.name, async () => {
                    
                    // When callback is triggered, send the id of the word to the database and await its deletion
                    await window.api.deleteWord(word.id);

                    // Then, re-retrieve the lexicon after deletion for repopulation
                    await retrieveLexicon(globalState.currentLang);
                })
            })
        });


        // Find any alternate versions of the add button
        const defaultCardAdd = document.querySelector('.lex_add.alt_ver');

        if (defaultCardAdd)
        { // If there are any, remove them
            // [this check is here so that if the user switches from a language with no words]
            // [to one that does have words you don't wind up with an extra button lying about]

            defaultCardAdd.remove();
        }
    }
    else
    { // Else, if there's no words returned, create a variant add button that acts as a default

        // Instantiate element
        const defaultCardAdd = document.createElement('button');
        defaultCardAdd.innerHTML = "A D D • N E W • W O R D";
        defaultCardAdd.classList.add('lex_add', 'alt_ver');
        defaultCardAdd.id = 'lex_add';

        if (!contentBox.contains(document.querySelector('.lex_add.alt_ver')))
        { // If the content box doesn't already contain the alternate variant, append a new one
            
            contentBox.appendChild(defaultCardAdd);
        }
    }

    /*[LOG]*/ console.log("[LEXICON] Updated Lexicon page with retrieved content.");
    
}

