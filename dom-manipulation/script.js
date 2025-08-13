const QUOTES_KEY = "quotes";
const SELECTED_CATEGORY_KEY = "selectedCategory";

let quotes = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];

function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    const lastCategory = localStorage.getItem(SELECTED_CATEGORY_KEY);
    if (lastCategory) {
        categoryFilter.value = lastCategory;
        filterQuotes();
    }
}

function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem(SELECTED_CATEGORY_KEY, selectedCategory);

    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = "";

    let filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    filteredQuotes.forEach(q => {
        const p = document.createElement("p");
        p.textContent = `"${q.text}" - ${q.author}`;
        quoteDisplay.appendChild(p);
    });
}

function addQuote(text, author, category) {
    quotes.push({ text, author, category });
    localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
    populateCategories();
    filterQuotes();
}

async function fetchQuotesFromServer() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const serverData = await response.json();

        const serverQuotes = serverData.slice(0, 5).map(post => ({
            text: post.title,
            author: post.body,
            category: ["Motivation", "Life", "Humor"][Math.floor(Math.random() * 3)]
        }));

        quotes = serverQuotes;
        localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));

        populateCategories();
        filterQuotes();
        console.log("Quotes synced from server.");
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
    }
}

setInterval(fetchQuotesFromServer, 30000); 

document.addEventListener("DOMContentLoaded", () => {
    populateCategories();
    filterQuotes();
    fetchQuotesFromServer();
});
