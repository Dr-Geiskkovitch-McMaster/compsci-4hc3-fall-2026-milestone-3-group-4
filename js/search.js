const searchInput = document.querySelector("#notes-search");
const searchPanel = document.querySelector("#search-panel");
const clearButton = document.querySelector("#clear-search");

const recentSearches = ["Project ideas", "Meeting notes", "Shopping list"];

// Replace these examples with sample notes that fit your prototype.
const sampleNotes = [
  { title: "Project ideas", description: "Ideas for the group project" },
  { title: "Meeting notes", description: "Topics and action items from our meeting" },
  { title: "Shopping list", description: "Things to pick up this week" },
  { title: "Research", description: "Links and notes for the assignment" },
];

function addHighlightedText(element, text, query) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());

  if (index === -1 || !query) {
    element.textContent = text;
    return;
  }

  element.append(
    document.createTextNode(text.slice(0, index)),
  );

  const match = document.createElement("mark");
  match.textContent = text.slice(index, index + query.length);
  element.append(match);

  element.append(
    document.createTextNode(text.slice(index + query.length)),
  );
}

function renderRows(items, query = "") {
  searchPanel.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No matching notes";
    searchPanel.append(empty);
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "search-row";

    const icon = document.createElement("span");
    icon.className = "row-icon";
    icon.textContent = "✦";

    const text = document.createElement("div");
    text.className = "row-text";

    const title = document.createElement("span");
    title.className = "row-title";
    addHighlightedText(title, item.title, query);

    const description = document.createElement("span");
    description.className = "row-description";
    addHighlightedText(description, item.description, query);

    text.append(title, description);
    row.append(icon, text);
    searchPanel.append(row);
  }
}

function updateSearch() {
  const query = searchInput.value.trim();
  searchPanel.hidden = false;

  if (!query) {
    const heading = document.createElement("p");
    heading.className = "panel-heading";
    heading.textContent = "Recent searches";

    searchPanel.replaceChildren(heading);

    for (const term of recentSearches) {
      const row = document.createElement("div");
      row.className = "search-row";
      row.textContent = `◉　${term}`;
      row.addEventListener("click", () => {
        searchInput.value = term;
        updateSearch();
      });
      searchPanel.append(row);
    }
    return;
  }

  const matches = sampleNotes.filter(note =>
    `${note.title} ${note.description}`.toLowerCase().includes(query.toLowerCase())
  );

  renderRows(matches, query);
}

searchInput.addEventListener("focus", updateSearch);
searchInput.addEventListener("input", updateSearch);

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  updateSearch();
});

document.addEventListener("click", event => {
  if (!event.target.closest(".search")) {
    searchPanel.hidden = true;
  }
});
