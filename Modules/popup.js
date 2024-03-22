import { select, btn, option, setSelector } from "../main.js";
import { lists } from "./lists.js";

export const popup = document.getElementById("popup");
export const overlay = document.getElementById("overlay");

export const buffers = {
    add: document.getElementById("addListB"),
    addContinue: document.getElementById("continueAddListB"),
    set: document.getElementById("setListB"),
    info: document.getElementById("infoB"),
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
function setList(reset=false) {
    buffers.set.classList.remove("hide");
    if (!reset) {
        btn.arrow.classList.add("hide");
        btn.info.classList.add("hide");
        select.q.classList.add("hide");
        select.a.classList.add("hide");
        option.range.classList.add("hide");
        btn.load.classList.add("hide");
        setSelector(select.list, lists);
    }
}

/**
 * Sets up the area for the user to change their settings.
 */
function openSettings() {
    buffers.settings.classList.remove("hide");
}

function showInfo(list) {
    buffers.info.classList.remove("hide");
    btn.arrow.classList.remove("hide");
}

/**
 * Toggles the popup window and sets up the relevent information based on what the user selected.
 * @param {Object} [popupType={}]      Shows which popup widow has been opened
 * @param {Boolean} popupType.add      True if user opened the addList popup window
 * @param {Boolean} popupType.set      True if user opened the setList popup window
 * @param {Boolean} popupType.settings True if user opened the settings popup window
 */
export function togglePopup({add, set, settings, info} = {}, toggleBuffer=false, reset=false, list=null) {
    if (!toggleBuffer) {
        popup.classList.toggle("hide");
        overlay.classList.toggle("hide");
        
        if (isPopup) isPopup = false;
        else isPopup = true;

        while (buffers.addContinue.firstChild) {
            buffers.addContinue.removeChild(buffers.addContinue.firstChild);
        }
    }
    
    for (let b in buffers) {
        buffers[b].classList.add("hide");
    }
    
    if (set) setList(reset);
    if (settings) openSettings();
    if (add) addList();
    if (info) showInfo(list);
}
