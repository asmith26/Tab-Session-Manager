/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//初回起動時にオプションページを表示して設定を初期化
browser.runtime.onInstalled.addListener(function () {
    browser.tabs.create({
        url: "options/options.html#information",
        active: false
    });
});

let S = new settingsObj()

var sessions = [];
var sessionStartTime = Date.now();

//起動時の設定
initSettings().then(function () {
    updateTags();
    updateSessionId();
    updateAutoName();
    setStorage();
    setAutoSave();
    autoSaveWhenClose()
        .then(openLastSession);
    browser.storage.onChanged.addListener(setAutoSave);
    browser.tabs.onActivated.addListener(replacePage);
    browser.windows.onFocusChanged.addListener(replacePage);

    //ウィンドウを閉じたときに保存
    browser.tabs.onUpdated.addListener(onUpdate);
    browser.tabs.onCreated.addListener(autoSaveWhenClose);
    browser.tabs.onRemoved.addListener(autoSaveWhenClose);
    browser.windows.onCreated.addListener(autoSaveWhenClose);

    backupSessions();
});

//設定の初期化
function initSettings(value) {
    return new Promise(function (resolve, reject) {
        browser.storage.local.get(["sessions"], function (value) {
            //sessions初期化
            if (value.sessions != undefined) sessions = value.sessions;
            else sessions = [];
            S.init()
                .then(() => {
                    resolve();
                });
        });
    })
}

//過去のバージョンのautosaveのセッション名を変更
function updateAutoName() {
    for (let i in sessions) {
        if (sessions[i].tag.includes('winClose')) {

            if (sessions[i].name === "Auto Saved - Window was closed")
                sessions[i].name = browser.i18n.getMessage("winCloseSessionName");

        } else if (sessions[i].tag.includes('regular')) {

            if (sessions[i].name === "Auto Saved - Regularly")
                sessions[i].name = browser.i18n.getMessage("regularSaveSessionName");

        }
    }
}

//ver1.9.2以前のセッションのタグを配列に変更
function updateTags() {
    for (let i of sessions) {
        if (!Array.isArray(i.tag)) {
            i.tag = i.tag.split(' ');
        }
    }
}

//ver1.9.2以前のセッションにUUIDを追加 タグからauto,userを削除
function updateSessionId() {
    for (let i of sessions) {
        if (!i['id']) {
            i['id'] = UUID.generate();

            i.tag = i.tag.filter((element) => {
                return !(element == 'user' || element == 'auto');
            });
        }
    }
}

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.message) {
        case "save":
            const name = request.name;
            const property = request.property;
            saveSession(name, [], property).catch(() => {});
            break;
        case "open":
            openSession(sessions[request.number], request.property);
            break;
        case "remove":
            removeSession(request.number);
            break;
        case "rename":
            renameSession(request.sessionNo, request.name);
            break;
        case "import":
            importSessions(request.importSessions);
            break;
        case "clearAllSessions":
            clearAllSessions();
            break;
        case "getSessions":
            getSessions(request, sender, sendResponse);
            break;
        case "addTag":
            addTag(request.id, request.tag);
            break;
        case "removeTag":
            removeTag(request.id, request.tag);
            break;
    }
});

function getSessionNo(id) {
    const sessionNo = sessions.findIndex((element) => {
        return element.id == id
    });
    return sessionNo
}

function getSessions(request, sender, sendResponse) {
    let returnSessions;
    if (request.id == null) {
        returnSessions = sessions;
    } else {
        returnSessions = sessions.filter((element) => {
            return element.id == request.id
        });
    }
    sendResponse({
        sessions: returnSessions
    });

}
