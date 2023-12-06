import { select, btn, setSelector } from "../main.js";
import { lists } from "./lists.js";

export const popup = document.getElementById("popup");
export const overlay = document.getElementById("overlay");

export const buffers = {
    add: document.getElementById("addListB"),
    addContinue: document.getElementById("continueAddListB"),
    set: document.getElementById("setListB"),
    settings: document.getElementById("settingsB")
};

export var isPopup = false;

/**
 * Sets up the area for the user to create their own list.
 */
function addList() {
    buffers.add.classList.remove("hide");
}

/**
 * Sets up the area for the user to choose a new list to start studying.
 */
function setList() {
    buffers.set.classList.remove("hide");
    for (let s in select) select[s].classList.add("hide");
    btn.load.classList.add("hide");
    setSelector(select.list, lists);
}

/**
 * Sets up the area for the user to change their settings.
 */
function openSettings() {
    buffers.settings.classList.remove("hide");
}

/**
 * Toggles the popup window and sets up the relevent information based on what the user selected.
 * @param {Object} [popupType={}]      Shows which popup widow has been opened
 * @param {Boolean} popupType.add      True if user opened the addList popup window
 * @param {Boolean} popupType.set      True if user opened the setList popup window
 * @param {Boolean} popupType.settings True if user opened the settings popup window
 */
export function togglePopup({add, set, settings} = {}) {
    popup.classList.toggle("hide");
    overlay.classList.toggle("hide");
    
    if (isPopup) isPopup = false;
    else isPopup = true;

    for (let b in buffers) {
        buffers[b].classList.add("hide");
    }

    while (buffers.addContinue.firstChild) {
        buffers.addContinue.removeChild(buffers.addContinue.firstChild);
    }
    
    if (set) setList();
    if (settings) openSettings();
    if (add) addList();
}
