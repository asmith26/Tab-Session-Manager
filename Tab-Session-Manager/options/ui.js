/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let e = {};
e.hash = location.href;

if (e.hash.indexOf('#') != -1) {
    e.hash = '#' + e.hash.split('#')[1];
} else {
    e.hash = "#settings";
}
readHash(e);

// hash の監視を開始
tm.HashObserver.enable();
document.addEventListener("changehash", readHash, false);

function readHash(e) {
    const hash = e.hash.split('?')[0];
    let selected = document.getElementsByClassName("selected");
    selected[0].classList.remove("selected");

    document.getElementById("settings").style.display = "none";
    document.getElementById("sessions").style.display = "none";
    document.getElementById("information").style.display = "none";

    switch (hash) {
        case "#settings":
            document.getElementById("settings").style.display = "block";
            document.getElementsByClassName("settingsLabel")[0].classList.add("selected");
            break;
        case "#sessions":
            document.getElementById("sessions").style.display = "block";
            document.getElementsByClassName("sessionsLabel")[0].classList.add("selected");
            break;
        case "#information":
            document.getElementById("information").style.display = "block";
            document.getElementsByClassName("informationLabel")[0].classList.add("selected");
            break;
        default:
            document.getElementById("settings").style.display = "block";
            document.getElementsByClassName("settingsLabel")[0].classList.add("selected");
            break;
    }

    const params = getParams(e.hash);
    switch (params.action) {
        case 'export':
            exportSessions(params.id);
    }
}

function getParams(hash) {
    let params = {};
    if (hash.split('?')[1] == undefined) return params;
    hash = hash.split('?')[1].split('&');
    for (let i of hash) {
        params[i.split('=')[0]] = i.split('=')[1];
    }
    return params;
}


function showImportFile(fileName, sessions) {
    document.getElementById("fileList").parentNode.style.display = "block";
    document.getElementById("fileList").insertAdjacentHTML('beforeend', returnFileListNode(fileName, sessions));
}

function returnFileListNode(fileName, sessions) {
    const sessionLabel = browser.i18n.getMessage("sessionLabel").toLowerCase();
    const sessionsLabel = browser.i18n.getMessage("sessionsLabel").toLowerCase();
    let sessionsState
    if (sessions == undefined) sessionsState = browser.i18n.getMessage("readFailedMessage");
    else if (sessions.length <= 1) sessionsState = `${sessions.length} ${sessionLabel}`;
    else sessionsState = `${sessions.length} ${sessionsLabel}`;

    return "<li><div class=optionContainer><div class=optionText><p>" +
        fileName + "</p><p class=caption>" + sessionsState + "</p></div></div></li>";
}

function clearImportFile() {
    document.getElementById("fileList").parentNode.style.display = "none";
    document.getElementById("fileList").innerHTML = "";
}

document.getElementsByClassName("amazonUrl")[0].href = browser.i18n.getMessage("amazonUrl");
document.getElementsByClassName("addonUrl")[0].href = browser.i18n.getMessage("addonUrl");
