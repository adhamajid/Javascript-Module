import { run } from "./app/app.js";
import { AlertService } from "./app/alert.service.js";
import { CalculatorService } from "./app/calculator.service.js";
import { JokesService } from "./app/jokes.service.js";

import "./images/load.gif";
import "./style/style.css";

const alertService = new AlertService();
const calculatorService = new CalculatorService();
const jokesService = new JokesService();

run(alertService, calculatorService, jokesService);

// Function to add a note to the list and storage
async function addNoteToListAndStorage(title, content) {
  try {
    const response = await fetch("https://notes-api.dicoding.dev/v2/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body: content,
      }),
    });

    if (!response.ok) {
      throw new Error("Gagal menambahkan catatan");
    }

    const responseData = await response.json();

    const notesList = document.getElementById("notesList");
    const noteItem = document.createElement("div");
    noteItem.classList.add("note-item");
    const time = responseData.data.createdAt;

    noteItem.innerHTML = `
      <h3>${responseData.data.title}</h3>
      <p>${responseData.data.body}</p>
      <small>Dibuat pada: ${time}</small>
      <button class="delete-button">Hapus</button>
      <button class="archive-button">Arsipkan</button>
    `;

    notesList.appendChild(noteItem);

    // Handle note deletion
    const deleteButton = noteItem.querySelector(".delete-button");
    deleteButton.addEventListener("click", async function () {
      try {
        const deleteResponse = await fetch(
          `https://notes-api.dicoding.dev/v2/notes/${responseData.data.id}`,
          {
            method: "DELETE",
          }
        );

        if (!deleteResponse.ok) {
          throw new Error("Gagal menghapus catatan");
        }

        noteItem.remove();
        updateLocalStorage();
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    });

    // Handle note archiving
    const archiveButton = noteItem.querySelector(".archive-button");
    archiveButton.addEventListener("click", async function () {
      try {
        let archiveResponse;
        if (noteItem.classList.contains("archived")) {
          archiveResponse = await fetch(
            `https://notes-api.dicoding.dev/v2/notes/${responseData.data.id}/unarchive`,
            {
              method: "POST",
            }
          );
        } else {
          archiveResponse = await fetch(
            `https://notes-api.dicoding.dev/v2/notes/${responseData.data.id}/archive`,
            {
              method: "POST",
            }
          );
        }

        if (!archiveResponse.ok) {
          throw new Error("Gagal mengubah status catatan");
        }

        if (noteItem.classList.contains("archived")) {
          noteItem.classList.remove("archived");
          archiveButton.textContent = "Arsipkan";
        } else {
          noteItem.classList.add("archived");
          archiveButton.textContent = "Buka Arsip";
        }

        updateLocalStorage();
      } catch (error) {
        console.error("Error updating note:", error);
      }
    });

    updateLocalStorage();
  } catch (error) {
    console.error("Error adding note:", error);
  }
}

// Fungsi untuk menampilkan waktu saat ini dalam format "HH:mm DD/MM/YYYY"
function getCurrentTime() {
  const now = new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return now.toLocaleString("en-US", options);
}

// Komponen header
class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <h1>Note Application</h1>
      </header>
    `;
  }
}
customElements.define("app-header", AppHeader);

// Fungsi untuk memperbarui localStorage dengan data catatan saat ini
function updateLocalStorage() {
  const notesList = document.querySelectorAll(".note-item");
  const notesData = [];
  notesList.forEach((noteItem) => {
    const title = noteItem.querySelector("h3").textContent;
    const content = noteItem.querySelector("p").textContent;
    const archived = noteItem.classList.contains("archived");
    notesData.push({ title, content, archived });
  });
  localStorage.setItem("notesData", JSON.stringify(notesData));
}

// Fungsi untuk mendapatkan catatan dari localStorage saat halaman dimuat
function loadNotesFromStorage() {
  const storedData = localStorage.getItem("notesData");
  if (storedData) {
    const notesData = JSON.parse(storedData);
    notesData.forEach((note) => {
      addNoteToListAndStorage(note.title, note.content);
      const noteItem = document.querySelector(".note-item:last-child");
      if (note.archived) {
        noteItem.classList.add("archived");
        noteItem.querySelector(".archive-button").textContent = "Unarchive";
      }
    });
  }
}

// Komponen form catatan
class NoteForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form id="noteForm">
        <input type="text" id="noteTitle" placeholder="Enter note title..." required>
        <textarea id="noteContent" placeholder="Enter your note here..." required></textarea>
        <button type="submit">Add Note</button>
      </form>
    `;

    // Tangani penambahan catatan saat formulir dikirim
    const noteForm = this.querySelector("#noteForm");
    noteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const noteTitle = this.querySelector("#noteTitle").value;
      const noteContent = this.querySelector("#noteContent").value;
      if (noteTitle.trim() !== "" && noteContent.trim() !== "") {
        addNoteToListAndStorage(noteTitle, noteContent);
        this.reset();
      } else {
        alert("Please enter both note title and content before adding!");
      }
    });
  }
}
customElements.define("note-form", NoteForm);

// Komponen daftar catatan
class NoteList extends HTMLElement {
  connectedCallback() {
    const notesData = [
      {
        id: "notes-jT-jjsyz61J8XKiI",
        title: "Welcome to Notes, Dimas!",
        body: "Welcome to Notes! This is your first note. You can archive it, delete it, or create new ones.",
        createdAt: "2022-07-28T10:03:12.594Z",
        archived: false,
      },
      {
        id: "notes-aB-cdefg12345",
        title: "Meeting Agenda",
        body: "Discuss project updates and assign tasks for the upcoming week.",
        createdAt: "2022-08-05T15:30:00.000Z",
        archived: false,
      },
      {
        id: "notes-XyZ-789012345",
        title: "Shopping List",
        body: "Milk, eggs, bread, fruits, and vegetables.",
        createdAt: "2022-08-10T08:45:23.120Z",
        archived: false,
      },
      {
        id: "notes-1a-2b3c4d5e6f",
        title: "Personal Goals",
        body: "Read two books per month, exercise three times a week, learn a new language.",
        createdAt: "2022-08-15T18:12:55.789Z",
        archived: false,
      },
      {
        id: "notes-LMN-456789",
        title: "Recipe: Spaghetti Bolognese",
        body: "Ingredients: ground beef, tomatoes, onions, garlic, pasta. Steps:...",
        createdAt: "2022-08-20T12:30:40.200Z",
        archived: false,
      },
      {
        id: "notes-QwErTyUiOp",
        title: "Workout Routine",
        body: "Monday: Cardio, Tuesday: Upper body, Wednesday: Rest, Thursday: Lower body, Friday: Cardio.",
        createdAt: "2022-08-25T09:15:17.890Z",
        archived: false,
      },
      {
        id: "notes-abcdef-987654",
        title: "Book Recommendations",
        body: "1. 'The Alchemist' by Paulo Coelho\n2. '1984' by George Orwell\n3. 'To Kill a Mockingbird' by Harper Lee",
        createdAt: "2022-09-01T14:20:05.321Z",
        archived: false,
      },
      {
        id: "notes-zyxwv-54321",
        title: "Daily Reflections",
        body: "Write down three positive things that happened today and one thing to improve tomorrow.",
        createdAt: "2022-09-07T20:40:30.150Z",
        archived: false,
      },
      {
        id: "notes-poiuyt-987654",
        title: "Travel Bucket List",
        body: "1. Paris, France\n2. Kyoto, Japan\n3. Santorini, Greece\n4. New York City, USA",
        createdAt: "2022-09-15T11:55:44.678Z",
        archived: false,
      },
      {
        id: "notes-asdfgh-123456",
        title: "Coding Projects",
        body: "1. Build a personal website\n2. Create a mobile app\n3. Contribute to an open-source project",
        createdAt: "2022-09-20T17:10:12.987Z",
        archived: false,
      },
      {
        id: "notes-5678-abcd-efgh",
        title: "Project Deadline",
        body: "Complete project tasks by the deadline on October 1st.",
        createdAt: "2022-09-28T14:00:00.000Z",
        archived: false,
      },
      {
        id: "notes-9876-wxyz-1234",
        title: "Health Checkup",
        body: "Schedule a routine health checkup with the doctor.",
        createdAt: "2022-10-05T09:30:45.600Z",
        archived: false,
      },
      {
        id: "notes-qwerty-8765-4321",
        title: "Financial Goals",
        body: "1. Create a monthly budget\n2. Save 20% of income\n3. Invest in a retirement fund.",
        createdAt: "2022-10-12T12:15:30.890Z",
        archived: false,
      },
      {
        id: "notes-98765-54321-12345",
        title: "Holiday Plans",
        body: "Research and plan for the upcoming holiday destination.",
        createdAt: "2022-10-20T16:45:00.000Z",
        archived: false,
      },
      {
        id: "notes-1234-abcd-5678",
        title: "Language Learning",
        body: "Practice Spanish vocabulary for 30 minutes every day.",
        createdAt: "2022-10-28T08:00:20.120Z",
        archived: false,
      },
    ];
    this.innerHTML = '<div id="notesList"></div>';
    const notesListContainer = this.querySelector("#notesList");

    notesData.forEach((note) => {
      const noteItem = document.createElement("div");
      noteItem.classList.add("note-item");
      const time = getCurrentTime();

      noteItem.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.body}</p>
        <small>Created at: ${time}</small>
        <button class="delete-button">Delete</button>
        <button class="archive-button">Archive</button>
      `;

      notesListContainer.appendChild(noteItem);

      // Tangani penghapusan catatan
      const deleteButton = noteItem.querySelector(".delete-button");
      deleteButton.addEventListener("click", function () {
        noteItem.remove();
        updateLocalStorage();
      });

      // Tangani penyetelan catatan sebagai arsip
      const archiveButton = noteItem.querySelector(".archive-button");
      archiveButton.addEventListener("click", function () {
        if (noteItem.classList.contains("archived")) {
          // Jika catatan sudah diarsipkan, kembalikan dari arsip
          noteItem.classList.remove("archived");
          archiveButton.textContent = "Archive";
        } else {
          // Jika catatan belum diarsipkan, arsipkan catatan
          noteItem.classList.add("archived");
          archiveButton.textContent = "Unarchive";
        }
        updateLocalStorage();
      });
      updateLocalStorage();
    });
  }
}
customElements.define("note-list", NoteList);

// Function to load non-archived notes from API
async function loadNonArchivedNotesFromAPI() {
  try {
    const response = await fetch("https://notes-api.dicoding.dev/v2/notes", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Gagal memuat catatan non-arsip");
    }

    const responseData = await response.json();
    const notesData = responseData.data;

    notesData.forEach((note) => {
      addNoteToList(
        note.title,
        note.body,
        note.createdAt,
        note.archived,
        note.id
      );
    });
  } catch (error) {
    console.error("Error loading non-archived notes:", error);
  }
}

// Function to load archived notes from API
async function loadArchivedNotesFromAPI() {
  try {
    const response = await fetch(
      "https://notes-api.dicoding.dev/v2/notes/archived",
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Gagal memuat catatan yang diarsipkan");
    }

    const responseData = await response.json();
    const notesData = responseData.data;

    notesData.forEach((note) => {
      addNoteToList(
        note.title,
        note.body,
        note.createdAt,
        note.archived,
        note.id
      );
    });
  } catch (error) {
    console.error("Error loading archived notes:", error);
  }
}

// Function to add a note to the list
function addNoteToList(title, content, createdAt, archived, id) {
  const notesList = document.getElementById("notesList");
  const noteItem = document.createElement("div");
  noteItem.classList.add("note-item");

  noteItem.innerHTML = `
    <h3>${title}</h3>
    <p>${content}</p>
    <small>Created at: ${createdAt}</small>
    <button class="delete-button">Delete</button>
    <button class="archive-button">${archived ? "Unarchive" : "Archive"}</button>
  `;

  if (archived) {
    noteItem.classList.add("archived");
  }

  notesList.appendChild(noteItem);

  // Handle note deletion
  const deleteButton = noteItem.querySelector(".delete-button");
  deleteButton.addEventListener("click", async function () {
    try {
      const deleteResponse = await fetch(
        `https://notes-api.dicoding.dev/v2/notes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Gagal menghapus catatan");
      }

      noteItem.remove();
      updateLocalStorage();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  });

  // Handle note archiving
  const archiveButton = noteItem.querySelector(".archive-button");
  archiveButton.addEventListener("click", async function () {
    try {
      const archiveResponse = await fetch(
        `https://notes-api.dicoding.dev/v2/notes/${id}/${archived ? "unarchive" : "archive"}`,
        {
          method: "POST",
        }
      );

      if (!archiveResponse.ok) {
        throw new Error("Gagal mengubah status catatan");
      }

      if (archived) {
        noteItem.classList.remove("archived");
        archiveButton.textContent = "Archive";
      } else {
        noteItem.classList.add("archived");
        archiveButton.textContent = "Unarchive";
      }

      updateLocalStorage();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  });

  updateLocalStorage();
}

// Function to load notes from API when page loads
async function loadNotesFromAPI() {
  const loadingIndicator = document.getElementById("loading");
  loadingIndicator.style.display = "block"; // Tampilkan indikator loading

  try {
    await loadNonArchivedNotesFromAPI();
    await loadArchivedNotesFromAPI();
  } catch (error) {
    console.error("Error loading notes:", error);
  } finally {
    loadingIndicator.style.display = "none"; // Sembunyikan indikator loading setelah selesai
  }
}

// Call loadNotesFromAPI when the page loads
window.addEventListener("load", loadNotesFromAPI);
