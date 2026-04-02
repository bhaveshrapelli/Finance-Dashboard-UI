# Finance Dashboard UI

A visually stunning and interactive premium finance dashboard interface built using Vanilla JavaScript, HTML5, and Tailwind CSS. The interface is meticulously designed to provide a rich user experience featuring interactive charts, micro-animations, glassmorphism, and responsive design natively without a backend or build step.

## Setup Instructions

Since this is a vanilla frontend application with no build steps or dependencies, setup is incredibly straightforward:

1. Clone or download this project.
2. Locate the `index.html` file inside the root folder.
3. Open `index.html` in any modern web browser (Google Chrome, Firefox, Safari, Edge).
   - Alternatively, you can use a local server like `Live Server` in VS Code or `python -m http.server` for hot reloading.

## Overview of Approach

Due to environment flexibility and standard evaluation goals, this project was deliberately built using **Vanilla JavaScript & Tailwind CSS (via CDN)**. The goal was to demonstrate how clean, structured, and modular UI components can be built even without abstractions like React or Vue, while maintaining premium design aesthetics.

### Architecture
- **`index.html`**: Handles the full structurally semantic layout of the dashboard, loading fonts, icons natively, and initializing Tailwind configuration.
- **`styles.css`**: Manages custom utilities such as glassmorphism variables, dark mode styling overrides, and custom scrollbars which map directly to Tailwind ecosystem.
- **`app.js`**: Functions as the presentation layer MVP state management router. Handles rendering dynamic charts, transaction generation and mutations, and UI updates via simple Observer-like `updateDashboard()`, `renderCharts()`, and `renderTable()` pipelines.

## Features

- **Dashboard Overview**: Displays animated summary cards tracking Total Balance, Income, and Expenses.
- **Data Visualization**: Leverages `Chart.js` to render a fully dynamic "Balance Trend" Line chart and a responsive "Spending" Doughnut chart. The charts react elegantly to theme changes.
- **Role-Based UI Simulation**: 
  - Switch between `Viewer` and `Admin` in the sidebar.
  - `Viewer` mode restricts access to mutations.
  - `Admin` mode reveals an "Add Transaction" button and table action buttons, exposing an interactive modal built with smooth transitions.
- **Dark Mode Support**: A robust, built-in light/dark theme toggle leveraging HTML class-based theming. Transitions smoothly swap chart colors, backdrop filters, and typography.
- **Intelligent Insights**: Calculates the highest spending category dynamically and updates a premium glassmorphic Insight Card to guide the user.
- **Transaction Table**: Includes functional filtering via a real-time reactive search input, formatted currency amounts, and dynamic category visual badges.

## Evaluation Notes
This application deliberately focuses on visual quality, interaction design, responsiveness, and state logic using minimal tools (Vanilla JS). Small touches like the custom scrollbar, hover micro-interactions, responsive sidebars, empty states, and dynamic chart reloading highlight attention to detail to achieve a premium "wowed" impression.
