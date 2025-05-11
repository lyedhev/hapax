import { globalState } from './state.js';
import { populateClassTable } from '../grammar.js';
import { retrieveLexicon } from '../lexicon.js';



/**
 * Manages the switching of pages when passed an event and a page
 * @param {*} evt Event
 * @param {*} pageName Name/ID of the Page
 */
export function openPage(evt, pageName) {
    
    // Hide all page contents
    document.querySelectorAll('.content_container').forEach(container => {
        container.style.display = 'none';
    });

    // Remove "active" class from all sidebar buttons
    document.querySelectorAll('.page').forEach(pageBtn => {
        pageBtn.classList.remove('active');
    });

    
    // Select the given page
    const selectedPage = document.getElementById(pageName);

    if (selectedPage)
    { // If there is a matching page to what was passed into the function, display it

        selectedPage.style.display = 'block';

        /*[LOG]*/ console.log("[PAGE MANAGER] Page changed to", pageName);

    }
    else
    { // Else, print a warning to the console

        /*[LOG]*/ console.warn(`[PAGE MANAGER] Page "${pageName}" not found!`);
    }

    if (evt.currentTarget)
    { // If the event exists and had a target
      
        // Toggle "active" and send current page to local storage
        evt.currentTarget.classList.add('active');
        localStorage.setItem('lastPageName', pageName);
    }
}

/**
 * Sets up the page switching logic and the DOM-loading listener
 */
export function setUpPages() {

    // Define all main sidebar buttons that are also relevant to page logic
    // [marked with class ".page"]
    const pageButtons = document.querySelectorAll('.page.main');

    // For each button, add a listener
    pageButtons.forEach(button => {

        // Listen for the button being clicked
        button.addEventListener('click', (event) => {

            // Retrieve page name from button's 'data-page' attribute
            const pageName = button.dataset.page;
            openPage(event, pageName);
        });
    });
    

    // Listen for when the DOM is loaded, and automatically open the last opened page
    document.addEventListener('DOMContentLoaded', () => {

        // Load stored info
        const savedPage = localStorage.getItem('lastPageName') || 'sono';
        const savedLangId = localStorage.getItem('lastLanguageId');
        const savedLangName = localStorage.getItem('lastLangName') || "";
        const savedFallback = localStorage.getItem('fallbackLanguageId');

        // Open the page
        openPage({}, savedPage);

        if (savedLangId)
        { // If there is a previously saved language id, make sure it's saved to global data

            // Ensure that state.js has been updated as well
            globalState.currentLang = parseInt(savedLangId);
            globalState.fallbackLang = parseInt(savedFallback);

            // Repopulate containers
            populateClassTable(globalState.currentLang);
            retrieveLexicon(globalState.currentLang);

            // Enable all page buttons disabled by default
            document.querySelectorAll('.page').forEach(el => {
                el.removeAttribute('disabled');
            });
            
            // Update language heading
            document.querySelectorAll('.side_text_lang').forEach(p => {

                // Format the language name
                // [replace all spaces with bullet points, then insert spaces between all characters]
                p.textContent = savedLangName.toUpperCase().replace(/ /g, ' • ').split('').join(' ');
            });

            /*[LOG]*/ console.log("[PAGE MANAGER] User clicked an element inside 'drop_queried_content'.");
        }
        
    });
}

/**
 * Update currentLang with the id associated with the clicked element and store in local storage
 * @param {*} selectedId Language ID
 * @param {*} selectedTitle Language name
 */
export function openLang(selectedId, selectedTitle) {
    
    // Set the current language as the one passed in
    globalState.currentLang = parseInt(selectedId);
    localStorage.setItem('lastLanguageId', globalState.currentLang);

    /*[LOG]*/ console.log('[PAGE MANAGER] Changed selection to:', globalState.currentLang);
    

    // Enable all page buttons disabled by default
    document.querySelectorAll('.page').forEach(el => {
        el.removeAttribute('disabled');
    });
    
    // Update language heading
    document.querySelectorAll('.side_text_lang').forEach(p => {

        // Format the language name
        // [replace all spaces with bullet points, then insert spaces between all characters]
        localStorage.setItem('lastLangName', selectedTitle);
        p.textContent = selectedTitle.toUpperCase().replace(/ /g, ' • ').split('').join(' ');
    });

    // Populate all other fields based on currently selected item
    populateClassTable(globalState.currentLang);
    retrieveLexicon(globalState.currentLang);
}

