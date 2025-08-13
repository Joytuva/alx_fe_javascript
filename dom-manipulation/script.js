let quotes = [];
const localStorageKey = 'quotes';
const filterKey = 'lastSelectedCategory';
const lastSyncKey = 'lastSyncTime';
const apiURL = 'https://jsonplaceholder.typicode.com/posts'; 

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  populateCategories();
  restoreLastFilter();
  displayQuotes();

  syncWithServer();
  setInterval(syncWithServer, 10000);
});

function loadQuotes() {
  const stored = localStorage.getItem(localStorageKey);
  quotes = stored ? JSON.parse(stored) : [];
}

function saveQuotes() {
  localStorage.setItem(localStorageKey, JSON.stringify(quotes));
}

function addQuote() {
  const text = document.getElementById('quoteInput').value.trim();
  const category = document.getElementById('categoryInput').value.trim() || 'Uncategorized';
  if (!text) return alert('Quote cannot be empty');

  quotes.push({ text, category, updatedAt: Date.now() });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById('quoteInput').value = '';
  document.getElementById('categoryInput').value = '';

  pushToServer({ text, category, updatedAt: Date.now() });
}

function populateCategories() {
  const filterDropdown = document.getElementById('categoryFilter');
  const uniqueCategories = ['all', ...new Set(quotes.map(q => q.category))];

  filterDropdown.innerHTML = '';
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    filterDropdown.appendChild(option);
  });
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem(filterKey, category);
  displayQuotes(category);
}

function restoreLastFilter() {
  const lastFilter = localStorage.getItem(filterKey) || 'all';
  document.getElementById('categoryFilter').value = lastFilter;
}

function displayQuotes(category = 'all') {
  const container = document.getElementById('quoteDisplay');
  container.innerHTML = '';

  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  filtered.forEach(q => {
    const div = document.createElement('div');
    div.className = 'quote';
    div.textContent = `"${q.text}" — ${q.category}`;
    container.appendChild(div);
  });
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  link.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes.map(q => ({ ...q, updatedAt: Date.now() })));
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

async function syncWithServer() {
  try {
    const res = await fetch(apiURL);
    const serverData = await res.json();

    const serverQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: 'Server',
      updatedAt: Date.now()
    }));

    serverQuotes.forEach(sq => {
      const localIndex = quotes.findIndex(lq => lq.text === sq.text);
      if (localIndex > -1) {
        if (sq.updatedAt > quotes[localIndex].updatedAt) {
          quotes[localIndex] = sq; 
        }
      } else {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();

    document.getElementById('syncStatus').textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
    localStorage.setItem(lastSyncKey, Date.now());
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

async function pushToServer(quote) {
  try {
    await fetch(apiURL, {
      method: 'POST',
      body: JSON.stringify(quote),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Quote pushed to server:', quote);
  } catch (err) {
    console.error('Push failed:', err);
  }
}
