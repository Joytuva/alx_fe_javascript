const QUOTES_KEY = "quotes";
const SELECTED_CATEGORY_KEY = "selectedCategory";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

let quotes = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", category: "Inspiration" }
];

function displayQuote(quote) {
    document.getElementById("quoteDisplay").textContent = quote.text;
}

function populateCategories() {
    const categorySelect = document.getElementById("categoryFilter");
    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
    const savedCategory = localStorage.getItem(SELECTED_CATEGORY_KEY);
    if (savedCategory) {
        categorySelect.value = savedCategory;
        filterQuotes();
    }
}

function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem(SELECTED_CATEGORY_KEY, selectedCategory);
    let filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);
    if (filteredQuotes.length > 0) {
        displayQuote(filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)]);
    } else {
        document.getElementById("quoteDisplay").textContent = "No quotes in this category.";
    }
}

async function addQuote() {
    const text = document.getElementById("newQuote").value.trim();
    const category = document.getElementById("newCategory").value.trim();
    if (text && category) {
        const newQuote = { text, category };
        quotes.push(newQuote);
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
        populateCategories();
        filterQuotes();
        await sendQuoteToServer(newQuote);
    }
}

async function sendQuoteToServer(quote) {
    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quote)
        });
        const data = await response.json();
        console.log("Quote synced to server:", data);
    } catch (err) {
        console.error("Error sending quote to server:", err);
    }
}

async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();
        console.log("Fetched from server:", serverQuotes);

        let serverData = serverQuotes.map(item => ({
            text: item.title || item.text,
            category: item.category || "General"
        }));

        quotes = serverData;
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
        populateCategories();
        filterQuotes();
    } catch (err) {
        console.error("Error fetching from server:", err);
    }
}

async function syncQuotes() {
    console.log("Syncing quotes...");
    await fetchQuotesFromServer();
    for (let localQuote of quotes) {
        await sendQuoteToServer(localQuote);
    }
}

setInterval(syncQuotes, 30000);

document.addEventListener("DOMContentLoaded", () => {
    populateCategories();
    filterQuotes();
    syncQuotes();
});
