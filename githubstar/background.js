
chrome.webNavigation.onCompleted.addListener(function(details) {
    console.log(details.url);
    chrome.tabs.sendMessage(details.tabId, {action: "DoJob"});
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    //     chrome.tabs.sendMessage(tabs[0].id, {action: "DoJob"}, function(response) {});  
    // });
}, {url: [{urlMatches : 'https://github.com/search'}]});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    if(typeof chrome._LAST_STATE_UPDATED === 'undefined') {
        chrome._LAST_STATE_UPDATED = {}
    }
    if (typeof chrome._LAST_STATE_UPDATED[details.url] === 'undefined' || chrome._LAST_STATE_UPDATED[details.url] === false) {
        chrome._LAST_STATE_UPDATED[details.url] = true;
    } else {
        delete chrome._LAST_STATE_UPDATED[details.url];
        console.log(details.url);
        chrome.tabs.sendMessage(details.tabId, {action: "DoJob"});
        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        //     chrome.tabs.sendMessage(tabs[0].id, {action: "DoJob"}, function(response) {});  
        // });
    }
}, {url: [{urlMatches : 'https://github.com/search'}]});