/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let parameter = returnReplaceParameter(location.href);

document.title = parameter.title;
document.getElementsByClassName("title")[0].innerText = parameter.title;
document.getElementsByClassName("replacedUrl")[0].innerText = parameter.url;
document.head.insertAdjacentHTML('beforeend', '<link rel = "shortcut icon" href =' + parameter.favIconUrl + '>');

if (parameter.state == "open_faild") {
    document.getElementsByClassName("replacedPageMessage")[0].innerText = browser.i18n.getMessage("replacedPageMessage");
}

function returnReplaceParameter(url) {
    let parameter = {};
    let paras = url.split('?')[1].split('&');
    for (let p of paras) {
        parameter[p.split('=')[0]] = decodeURIComponent(p.split('=')[1]);
    }
    return parameter;
}
