import { btn, currentStr, listIndex, next } from "../main.js";
import { lists } from "./lists.js";

export var weights = {};

/**
 * Toggles the disabled attribute of the buttons w0, w1, w2, and w3.
 */
export function toggleWBtns() {
    btn.w0.toggleAttribute("disabled");
    btn.w1.toggleAttribute("disabled");
    btn.w2.toggleAttribute("disabled");
    btn.w3.toggleAttribute("disabled");
}

/**
 * Loads the weights variable from local storage if it already exists. Otherwise, creates new weights with a base value of 10.
 */
export function setWeights() {
    if (localStorage.getItem("Weights") !== null) load();
    else {
        weights = {};
        for (var list in lists) {
            weights[list] = [];
            for (let i = 0; i < Object.values(lists[list])[0].length; i++) {
                weights[list].push(10);
            }
        }
        save();
    }
}

/**
 * Changes the relevant weight based on the user's selection, saves the new weights to local storage, and moves to the next term.
 * @param {Number} w The factor to divide the current weight by
 */
export function changeWeights(w) {
    weights[currentStr.list][listIndex] = Math.ceil(weights[currentStr.list][listIndex] / w);
    save();
    next();
}

/**
 * Saves the weights variable to local storage.
 */
function save() {
    localStorage.setItem("Weights", JSON.stringify(weights));
}

/**
 * Gets the weights variable from local storage.
 */
function load() {
    weights = JSON.parse(localStorage.getItem("Weights"));
}