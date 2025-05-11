// Import functions
import { setUpPages } from './utils/page_manager.js'
import { setUpSoundChange } from './sound_change.js';
import { setUpDropdown } from './lang_dropdown.js';
import { setUpLexicon } from './lexicon.js';

// Import modals
import { setUpLanguageModal } from './modals/lang_modal.js';
import { setUpGrammarModal } from './modals/grammar_modal.js';
import { setUpWordModal } from './modals/lex_modal.js';
import { setUpDeleteModal } from './modals/delete_modal.js';



/*[LOG]*/ console.log('[RENDERER] Setting up page navigation listeners.');
setUpPages();

/*[LOG]*/ console.log('[RENDERER] Setting up Sound Change listeners.');
setUpSoundChange();

/*[LOG]*/ console.log('[RENDERER] Setting up Language dopdown listeners.');
setUpDropdown();

/*[LOG]*/ console.log('[RENDERER] Setting up Lexicon listeners.');
setUpLexicon();

/*[LOG]*/ console.log('[RENDERER] Setting up Language Modal box.');
setUpLanguageModal();

/*[LOG]*/ console.log('[RENDERER] Setting up Grammar Modal box.');
setUpGrammarModal();

/*[LOG]*/ console.log('[RENDERER] Setting up Lexicon Modal box.');
setUpWordModal();

/*[LOG]*/ console.log('[RENDERER] Setting up deletion Modal box.');
setUpDeleteModal();