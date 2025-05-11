const { contextBridge, ipcRenderer } = require('electron');

// | IPC handlers are safe channels that expose certain portions of given code to the HTML renderer
// |    (so, a <script> tag, be it referencing a different file or not)
// |
// | Because of Electron's security processes,
// |    this is the only way code from different .js files can be imported into the main HTML process
// |    outside of the main.js that is loaded at runtime


// Python bridge
contextBridge.exposeInMainWorld('electronAPI', {
    processLists: (rulesList, inputList) => ipcRenderer.invoke('process-lists', rulesList, inputList)
  });

// Main renderer bridge
contextBridge.exposeInMainWorld('api', {
    getDropdownData: () => ipcRenderer.invoke('get-dropdown-items'),
    addLanguage: (name) => ipcRenderer.invoke('add-language', name),
    updateLanguage: (id, newName) => ipcRenderer.invoke('update-language', id, newName),
    deleteLanguage: (languageId) => ipcRenderer.invoke('delete-language', languageId),

    getClasses: (languageId) => ipcRenderer.invoke('get-classes', languageId),
    addClass: (classData) => ipcRenderer.invoke('add-class', classData),
    updateClass: (data) => ipcRenderer.invoke('update-class', data),
    deleteClass: (classId) => ipcRenderer.invoke('delete-class', classId),

    getWords: (languageId) => ipcRenderer.invoke('get-words', languageId),
    addWord: (wordData) => ipcRenderer.invoke('add-word', wordData),
    updateWord: (word) => ipcRenderer.invoke('update-word', word),
    deleteWord: (wordId) => ipcRenderer.invoke('delete-word', wordId),
  });
