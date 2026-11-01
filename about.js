/* Filter the program source library. */
(function () {
  'use strict';
  var page = document.querySelector('.about-page');
  if (!page) return;
  var input = page.querySelector('#source-search');
  var buttons = Array.prototype.slice.call(page.querySelectorAll('[data-source-region]'));
  var records = Array.prototype.slice.call(page.querySelectorAll('[data-source-program]'));
  var count = page.querySelector('#source-count');
  var empty = page.querySelector('#source-empty');
  var list = page.querySelector('.about-source-list');
  var region = 'all';
  function normalise(text) {
    return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  function apply() {
    var query = normalise(input.value), shown = 0;
    records.forEach(function (record) {
      var match = (region === 'all' || region === record.dataset.region) &&
        (!query || normalise(record.dataset.search).indexOf(query) !== -1);
      record.hidden = !match;
      if (match) shown += 1;
    });
    count.textContent = shown + (shown === 1 ? ' program' : ' programs');
    list.hidden = shown === 0;
    empty.hidden = shown !== 0;
  }
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      region = button.dataset.sourceRegion;
      buttons.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      apply();
    });
  });
  input.addEventListener('input', apply);
  input.addEventListener('search', apply);
  page.querySelector('#source-reset').addEventListener('click', function () {
    region = 'all'; input.value = '';
    buttons.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.sourceRegion === 'all')); });
    apply(); input.focus();
  });
  apply();
})();
