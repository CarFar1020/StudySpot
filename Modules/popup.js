import { select, btn, setSelector } from "../main.js";
import { lists } from "./lists.js";

export const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");

const buffers = {
    add: document.getElementById("addListB"),
    set: document.getElementById("setListB"),
    settings: document.getElementById("settingsB")
};

export var isPopup = false;

/**
 * Sets up the area for the user to create their own list.
 */
function addList() {
    buffers.add.classList.toggle("hide");
}

/**
 * Sets up the area for the user to choose a new list to start studying.
 */
function setList() {
    buffers.set.classList.toggle("hide");
    for (let s in select) select[s].classList.add("hide");
    btn.load.classList.add("hide");
    setSelector(select.list, lists);
}

/**
 * Sets up the area for the user to change their settings.
 */
function openSettings() {
    buffers.settings.classList.toggle("hide");
}

/**
 * Toggles the popup window and sets up the relevent information based on what the user selected.
 */
export function togglePopup({add, set, settings} = {}) {
    popup.classList.toggle("hide");
    overlay.classList.toggle("hide");
    
    if (isPopup) isPopup = false;
    else isPopup = true;
    
    if (set) setList();
    if (settings) openSettings();
    if (add) addList();
}
