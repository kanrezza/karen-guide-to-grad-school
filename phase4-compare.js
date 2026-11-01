/* Client-side controls for the program comparison. */
(function () {
  'use strict';
  var page = document.querySelector('.compare-page');
  if (!page) return;
  var table = page.querySelector('#cmp');
  var body = table.tBodies[0];
  var rows = Array.prototype.slice.call(body.rows);
  var form = page.querySelector('.cmp-toolbar');
  var search = page.querySelector('#cmp-search');
  var onlyFull = page.querySelector('#cmp-only-full');
  var sort = page.querySelector('#cmp-sort');
  var regionButtons = Array.prototype.slice.call(page.querySelectorAll('[data-region-filter]'));
  var viewButtons = Array.prototype.slice.call(page.querySelectorAll('[data-cmp-view]'));
  var count = page.querySelector('#cmp-count');
  var shell = page.querySelector('#cmp-table-shell');
  var empty = page.querySelector('#cmp-empty');
  var region = 'all';
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  function normalise(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  function dateValue(row) {
    return row.dataset.date ? new Date(row.dataset.date + 'T00:00:00').getTime() : null;
  }
  function dateGroup(row) {
    var stamp = dateValue(row);
    if (row.dataset.dateStatus === 'reference' || (stamp !== null && stamp < today.getTime())) return 2;
    return stamp === null ? 1 : 0;
  }
  function updateDate(row) {
    var state = row.querySelector('.cmp-date-state');
    var status = row.dataset.dateStatus;
    var stamp = dateValue(row);
    var text = '';
    if (status === 'reference') {
      text = 'Closed reference';
      row.classList.add('is-closed');
    } else if (status === 'pending' || stamp === null) {
      text = 'Pending';
    } else if (status === 'reported') {
      text = stamp < today.getTime() ? 'Reported date passed' : 'Reported · confirm';
      row.classList.toggle('is-closed', stamp < today.getTime());
    } else {
      var days = Math.round((stamp - today.getTime()) / 86400000);
      row.classList.toggle('is-closed', days < 0);
      row.classList.toggle('is-soon', days >= 0 && days <= 14);
      text = days < 0 ? 'Date passed' : days === 0 ? 'Closes today' : days === 1 ? '1 day left' : days <= 14 ? days + ' days left' : '';
    }
    state.textContent = text;
    state.hidden = !text;
  }
  function apply() {
    var query = normalise(search.value);
    var mode = sort.value;
    rows.sort(function (a, b) {
      if (mode === 'stipend') return Number(b.dataset.stipend) - Number(a.dataset.stipend) || Number(a.dataset.rank) - Number(b.dataset.rank);
      if (mode === 'deadline') {
        var groupA = dateGroup(a), groupB = dateGroup(b);
        if (groupA !== groupB) return groupA - groupB;
        var dateA = dateValue(a), dateB = dateValue(b);
        if (dateA !== null && dateB !== null && dateA !== dateB) return groupA === 2 ? dateB - dateA : dateA - dateB;
      }
      return Number(a.dataset.rank) - Number(b.dataset.rank);
    });
    var visible = 0;
    rows.forEach(function (row) {
      var matches = (region === 'all' || row.dataset.region === region) &&
        (!onlyFull.checked || row.dataset.full === 'true') &&
        (!query || normalise(row.dataset.search).indexOf(query) !== -1);
      row.hidden = !matches;
      if (matches) visible += 1;
      body.appendChild(row);
    });
    count.replaceChildren();
    var strong = document.createElement('strong');
    strong.textContent = visible;
    count.appendChild(strong);
    count.appendChild(document.createTextNode(visible === 1 ? ' program shown' : ' programs shown'));
    shell.hidden = visible === 0;
    empty.hidden = visible !== 0;
  }
  function setRegion(value) {
    region = value;
    regionButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.regionFilter === value));
    });
  }
  function reset() {
    search.value = '';
    onlyFull.checked = false;
    sort.value = 'rank';
    setRegion('all');
    apply();
  }
  regionButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setRegion(button.dataset.regionFilter);
      apply();
    });
  });
  viewButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var view = button.dataset.cmpView;
      page.dataset.view = view;
      viewButtons.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
      shell.scrollLeft = 0;
    });
  });
  search.addEventListener('input', apply);
  search.addEventListener('search', apply);
  onlyFull.addEventListener('change', apply);
  sort.addEventListener('change', apply);
  form.addEventListener('submit', function (event) { event.preventDefault(); apply(); });
  form.addEventListener('reset', function (event) { event.preventDefault(); reset(); });
  page.querySelector('#cmp-empty-reset').addEventListener('click', function () { reset(); search.focus(); });
  rows.forEach(updateDate);
  apply();
})();
