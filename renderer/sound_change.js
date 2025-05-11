/**
 * Sets up and handles the processing of input/output on the Sound Change page.
 */
export function setUpSoundChange() {

    // Listen for the "apply sound change" button to be clicked
    document.getElementById('btn_apply').addEventListener('click', async () => {

        /*[LOG]*/ console.log("[SOUND CHANGE] Application of sound change requested.");

        // Take in inputs and declare output
        const rawRule = document.getElementById('sono_rules').value;
        const rawInput = document.getElementById('sono_input').value;
        const outputBox = document.getElementById('sono_output');


        // Process the input to create the lists to be sent to sound_change.py
        // Split the input by lines, trim each element, get rid of empty lines
        const rulesList = rawRule.split('\n').map(item => item.trim()).filter(item => item);
        const inputList = rawInput.split('\n').map(item => item.trim()).filter(item => item);

        /*[LOG]*/ console.log("[SOUND CHANGE] Refined rulesList: ", rulesList);
        /*[LOG]*/ console.log("[SOUND CHANGE] Refined inputList: ", inputList);

        
        // Send lists to sound_change.py via IPC handler and await the processed lists
        const result = await window.electronAPI.processLists(rulesList, inputList);

        /*[LOG]*/ console.log('[SOUND CHANGE] Result:', result);


        // Update the output container with the result, separating terms with a new line
        outputBox.textContent = result.join('\n');
    });
}