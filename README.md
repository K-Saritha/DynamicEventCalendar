
# Event Calendar Application

A modern, interactive event calendar built with React that allows users to manage and organize their events with ease.

🌐 **Live Demo:** [https://k-saritha.github.io/DynamicEventCalendar/](https://k-saritha.github.io/DynamicEventCalendar/)

---

## ✨ Features

### 📅 Calendar Interface
- Interactive **monthly, weekly, and daily views**
- Agenda view for quick access to upcoming events
- Week-based grid layout with full month support
- Visual indicators for **today's date** and **selected dates**
- **Date picker** for direct navigation to a specific date
- Smooth transitions between months, weeks, and days
- Quick **"Today"** button for jumping to the current date

### 📝 Event Management
- Add custom **event title**, **description**, **start and end times**
- **Color coding** for different event categories
- Editable and deletable events with modal UI
- Recurring events with **daily, weekly, monthly** patterns
- Modify **single instance or entire series** of recurring events
- Optional notes and extended details for each event

### 💾 Persistent Storage
- ✅ All events are stored in **Local Storage**
- Events are **automatically saved** and **persist across page reloads**
- No need for a backend — fully functional offline

### 🔁 Event Conflict Management
- Real-time **conflict detection**
- Warning messages for overlapping time slots
- Visual **highlighting of conflicting events**
- Suggestions for **rescheduling** conflicting events

### 🔍 Search and Filter
- Real-time event **search as you type**
- Search through **titles** and **descriptions**
- Results include **event previews** and navigation to exact date

### 🖱️ Drag and Drop
- Easily **drag and drop** events between dates
- **Auto-update** of event timings upon drop
- Feedback highlighting and **conflict validation** on drop

### 🎯 Views & Agenda
- **Day View**: Detailed list of all events on a selected day
- **Week View**: Overview of a week with time slots and events
- **Month View**: Full calendar month layout
- **Agenda View**: Linear list of upcoming events with date context

### 🧑‍💻 User Experience
- Fully **responsive design** across desktop, tablet, and mobile
- Elegant **modals, transitions**, and **tooltips**
- Accessible, clean, and modern UI with **Tailwind CSS**

---

## 🛠️ Technologies Used

- **React**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **date-fns** (date utilities)
- **@dnd-kit/core** (drag and drop)
- **Context API** (global state)
- **Local Storage API** (event persistence)
- **gh-pages** (for deployment)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14+)
- npm

### Installation

```bash
git clone https://github.com/k-saritha/DynamicEventCalendar.git

npm install
````

### Start Development Server

```bash
npm run dev
```

Now open your browser at [http://localhost:5173](http://localhost:5173)

---

## 🧭 Usage

### Navigation

* Use arrow buttons or **date picker** to navigate
* Use **view selector** to switch between Month/Week/Day/Agenda


### Manage Events

* Click a day to **add** a new event
* Click an existing event to **edit** or **delete**
* Drag and drop events to move them
* Use the search bar to locate events instantly

### Event Persistence

* Events are saved automatically in your **browser's Local Storage**
* They remain intact even if you refresh or close the browser
* No sign-in or database required




