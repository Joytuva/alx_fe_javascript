let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Success is not final, failure is not fatal.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "Talk is cheap. Show me the code.", category: "Tech" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const categorySet = new Set(quotes.map(q => q.category));
  const select = document.getElementById('categorySelect');
  select.innerHTML = ""; 

  categorySet.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function showRandomQuote() {
  const category = document.getElementById('categorySelect').value;
  const filtered = quotes.filter(q => q.category === category);
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  const display = document.getElementById('quoteDisplay');

  display.textContent = quote ? `"${quote.text}"` : "No quotes in this category.";

  if (quote) {
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
  }
}

function createAddQuoteForm() {
  const container = document.getElementById('addQuoteFormContainer');

  const quoteInput = document.createElement('input');
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  container.appendChild(quoteInput);

  const categoryInput = document.createElement('input');
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  container.appendChild(categoryInput);

  const addButton = document.createElement('button');
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;
  container.appendChild(addButton);
}

function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!quoteText || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text: quoteText, category });
  saveQuotes();
  populateCategories();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added!");
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid file format.');
      }
    } catch (e) {
      alert('Failed to import quotes: ' + e.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

window.onload = () => {
  populateCategories();
  createAddQuoteForm();

  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const quoteObj = JSON.parse(lastQuote);
    document.getElementById('quoteDisplay').textContent = `"${quoteObj.text}"`;
  }
};
