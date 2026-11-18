/**
 * Dummy prototype data for the notes app.
 * Stored on `window.appData` so it is globally accessible and mutable
 * from any front-end script or browser console.
 */
const appData = {
  notes: [
    {
      id: "note-1",
      type: "text",
      text: "Finalize 4HC3 Milestone 3 wireframes and review Browse page card spacing with the group.",
      audio: null,
      tags: ["school", "4hc3", "ui"],
      dueDate: "2026-11-17",
      reminders: [
        {
          date: "2026-11-17T18:00:00",
          recurrence: null
        }
      ],
      attachments: [
        {
          id: "att-1",
          type: "image",
          name: "browse-wireframe.png",
          src: "assets/images/browse-wireframe.png"
        }
      ],
      pinned: true,
      open: true,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-15T10:30:00",
      lastModifiedAt: "2026-11-16T14:20:00"
    },
    {
      id: "note-2",
      type: "audio",
      text: null,
      audio: {
        src: "assets/audio/generic-audio-note-1.mp3",
        transcript: "Remember to pick up groceries on the way home: oat milk, bananas, coffee beans, and pasta."
      },
      tags: ["personal", "errands"],
      dueDate: "2026-11-18",
      reminders: [
        {
          date: "2026-11-18T16:30:00",
          recurrence: null
        }
      ],
      attachments: [],
      pinned: true,
      open: true,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-16T09:15:00",
      lastModifiedAt: "2026-11-16T09:15:00"
    },
    {
      id: "note-3",
      type: "text",
      text: "Weekly team standup prep: summarize front-end progress and list open accessibility fixes.",
      audio: null,
      tags: ["school", "4hc3"],
      dueDate: "2026-11-20",
      reminders: [
        {
          date: "2026-11-19T09:00:00",
          recurrence: {
            frequency: "weekly",
            interval: 1
          }
        },
        {
          date: "2026-11-20T08:30:00",
          recurrence: null
        }
      ],
      attachments: [],
      pinned: false,
      open: true,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-14T14:00:00",
      lastModifiedAt: "2026-11-17T08:45:00"
    },
    {
      id: "note-4",
      type: "audio",
      text: null,
      audio: {
        src: "assets/audio/generic-audio-note-2.mp3",
        transcript: "Idea for the Review tab: let users swipe or tap to archive old completed notes from last week."
      },
      tags: ["ideas", "ui"],
      dueDate: null,
      reminders: [],
      attachments: [
        {
          id: "att-2",
          type: "image",
          name: "review-sketch.png",
          src: "assets/images/review-sketch.png"
        }
      ],
      pinned: false,
      open: true,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-16T21:10:00",
      lastModifiedAt: "2026-11-16T21:10:00"
    },
    {
      id: "note-5",
      type: "text",
      text: "Water the plants and check soil moisture.",
      audio: null,
      tags: ["personal", "home"],
      dueDate: "2026-11-17",
      reminders: [
        {
          date: "2026-11-17T09:00:00",
          recurrence: {
            frequency: "daily",
            interval: 3
          }
        }
      ],
      attachments: [],
      pinned: false,
      open: false,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-10T08:00:00",
      lastModifiedAt: "2026-11-17T09:05:00"
    },
    {
      id: "note-6",
      type: "text",
      text: "Submit lab reflection before the end of next week. Double-check citations.",
      audio: null,
      tags: ["school"],
      dueDate: "2026-11-25",
      reminders: [],
      attachments: [
        {
          id: "att-3",
          type: "audio",
          name: "lecture-snippet.mp3",
          src: "assets/audio/lecture-snippet.mp3"
        },
        {
          id: "att-4",
          type: "image",
          name: "whiteboard-notes.png",
          src: "assets/images/whiteboard-notes.png"
        }
      ],
      pinned: false,
      open: true,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-17T11:45:00",
      lastModifiedAt: "2026-11-17T11:45:00"
    },
    {
      id: "note-7",
      type: "audio",
      text: null,
      audio: {
        src: "assets/audio/generic-audio-note-3.mp3",
        transcript: "Call the dentist to reschedule next month's cleaning appointment."
      },
      tags: ["personal", "health"],
      dueDate: null,
      reminders: [
        {
          date: "2026-11-18T10:00:00",
          recurrence: {
            frequency: "monthly",
            interval: 1
          }
        }
      ],
      attachments: [],
      pinned: false,
      open: false,
      deleted: true,
      deletedAt: "2026-11-16T18:00:00",
      createdAt: "2026-11-12T15:20:00",
      lastModifiedAt: "2026-11-16T18:00:00"
    },
    {
      id: "note-8",
      type: "text",
      text: "Reading notes — Don Norman, The Design of Everyday Things:\n\nAffordances are the possible actions between a person and an object, while signifiers communicate where those actions should happen. When a UI feels 'intuitive,' it usually means the signifiers match the user's existing mental model without forcing them to guess.",
      audio: null,
      tags: ["reading", "4hc3", "notes"],
      dueDate: null,
      reminders: [],
      attachments: [],
      pinned: false,
      open: true,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-13T19:40:00",
      lastModifiedAt: "2026-11-14T11:15:00"
    },
    {
      id: "note-9",
      type: "text",
      text: "Short story seed — The Night Train Station:\n\nEvery Tuesday at 11:42 PM, the departure board at the old station flickers and lists a destination that isn't on any map. Nobody ever buys a ticket for it, mostly because the ticket booth closes at nine, and the only people left on the platform are commuters who missed the last express.\n\nTonight, though, someone left a thermos of tea and a handwritten notebook on Bench 4. The first page just says: 'If you're reading this, don't wait for the 11:45—it hasn't run since 1998.' Could be fun to expand this into a full scene focusing on how the station sounds in the rain and why the protagonist decides to stay.",
      audio: null,
      tags: ["writing", "ideas", "creative"],
      dueDate: null,
      reminders: [],
      attachments: [],
      pinned: true,
      open: true,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-15T23:05:00",
      lastModifiedAt: "2026-11-17T00:12:00"
    },
    {
      id: "note-10",
      type: "audio",
      text: null,
      audio: {
        src: "assets/audio/generic-audio-note-4.mp3",
        transcript: "Random thought while walking back from class: what if ambient sound playlists adapted to how fast you're typing? Slow, steady rain when you're thinking, and subtle synth pulses once you hit a flow state."
      },
      tags: ["ideas", "creative"],
      dueDate: null,
      reminders: [],
      attachments: [],
      pinned: false,
      open: true,
      deleted: false,
      deletedAt: null,
      createdAt: "2026-11-17T17:30:00",
      lastModifiedAt: "2026-11-17T17:30:00"
    }
  ],

  tags: [
    { name: "school", color: "#3B7DD4", icon: "school" },
    { name: "4hc3", color: "#6750A4", icon: "assignment" },
    { name: "ui", color: "#00897B", icon: "palette" },
    { name: "personal", color: "#E65100", icon: "person" },
    { name: "errands", color: "#D81B60", icon: "shopping_cart" },
    { name: "ideas", color: "#F9A825", icon: "lightbulb" },
    { name: "home", color: "#2E7D32", icon: "home" },
    { name: "health", color: "#C62828", icon: "favorite" },
    { name: "reading", color: "#5E35B1", icon: "menu_book" },
    { name: "notes", color: "#546E7A", icon: "description" },
    { name: "writing", color: "#8E24AA", icon: "edit_note" },
    { name: "creative", color: "#00ACC1", icon: "auto_awesome" }
  ],

  filters: [
    {
      id: "filter-1",
      name: "Due This Week",
      color: "#3B7DD4",
      icon: "track_changes",
      criteria: {
        tags: null,
        hasTag: null,
        hasDeadline: true,
        hasReminders: null,
        dateRanges: {
          created: null,
          lastModified: null,
          reminders: null,
          deadline: { type: "relative", amount: 7, unit: "days", direction: "next" }
        }
      }
    },
    {
      id: "filter-2",
      name: "School & 4HC3",
      color: "#6750A4",
      icon: "school",
      criteria: {
        tags: { mode: "include", values: ["school", "4hc3"] },
        hasTag: true,
        hasDeadline: null,
        hasReminders: null,
        dateRanges: {
          created: null,
          lastModified: null,
          reminders: null,
          deadline: null
        }
      }
    },
    {
      id: "filter-3",
      name: "Non-School & Non-Personal",
      color: "#00897B",
      icon: "filter_alt",
      criteria: {
        tags: { mode: "exclude", values: ["school", "personal"] },
        hasTag: true,
        hasDeadline: null,
        hasReminders: null,
        dateRanges: {
          created: null,
          lastModified: null,
          reminders: null,
          deadline: null
        }
      }
    },
    {
      id: "filter-4",
      name: "Active Reminders (Nov 2026+)",
      color: "#E65100",
      icon: "notifications_active",
      criteria: {
        tags: null,
        hasTag: null,
        hasDeadline: null,
        hasReminders: true,
        dateRanges: {
          created: null,
          lastModified: { type: "static", start: "2026-11-01", end: null },
          reminders: null,
          deadline: null
        }
      }
    }
  ]
};

// Expose globally so any script or console interaction can read/modify it
window.appData = appData;

export default appData;

export function getAllTags() {
  const tags = new Set();
  for (const note of appData.notes) {
    if (note.deleted) continue;
    for (const tag of note.tags) {
      tags.add(tag);
    }
  }
  return [...tags].sort();
}

/**
 * Pairs bold accent colors with muted M3-style container & border colors.
 */
export const COLOR_MAP = {
  "#3B7DD4": { accent: "#3B7DD4", container: "#DDE8F6", border: "#A4AEBC" },
  "#6750A4": { accent: "#6750A4", container: "#EADDFF", border: "#CAC4D0" },
  "#00897B": { accent: "#00897B", container: "#D6EFEA", border: "#9BC4BC" },
  "#E65100": { accent: "#E65100", container: "#FBE5D6", border: "#D4AE96" },
  "#D81B60": { accent: "#D81B60", container: "#FADCE6", border: "#CFA1B1" },
  "#F9A825": { accent: "#F9A825", container: "#FDF0CE", border: "#D5C18A" },
  "#2E7D32": { accent: "#2E7D32", container: "#DCF0DD", border: "#A3C4A5" },
  "#C62828": { accent: "#C62828", container: "#FADDDD", border: "#CEA3A3" },
  "#5E35B1": { accent: "#5E35B1", container: "#E6DDF7", border: "#B7A8D4" },
  "#546E7A": { accent: "#546E7A", container: "#E2E9EC", border: "#B0BEC5" },
  "#8E24AA": { accent: "#8E24AA", container: "#F1DCF7", border: "#C7A3D1" },
  "#00ACC1": { accent: "#00ACC1", container: "#D7F2F6", border: "#9BC9D1" }
};

export function getColorPair(hex) {
  if (!hex) return COLOR_MAP["#6750A4"];
  const key = hex.toUpperCase();
  return COLOR_MAP[key] || {
    accent: hex,
    container: `color-mix(in srgb, ${hex} 14%, white)`,
    border: `color-mix(in srgb, ${hex} 35%, white)`
  };
}