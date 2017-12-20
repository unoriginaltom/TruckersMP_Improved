'use strict';

window.addEventListener('click', function (e) {
  e.preventDefault();
  if (e.target.href !== undefined) {
    chrome.tabs.create({
      url: e.target.href
    })
  }
});