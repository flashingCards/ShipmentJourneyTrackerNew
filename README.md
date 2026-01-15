# Shipment Journey Tracker

This is a web application designed to track shipment journeys in real-time. It offers a clean and intuitive interface to monitor the progress of multiple shipments, from pickup to delivery.

## About The Project

The Shipment Journey Tracker provides a centralized dashboard to view the status of various shipments. The application fetches data from a live Google Sheet and presents it in a user-friendly format. Each shipment is displayed as a card, which can be expanded to reveal a detailed timeline of its journey, highlighting ideal vs. actual dates and indicating any delays.

## Features

- **Shipment Overview:** Displays a list of all shipments with essential details like scancode, company, service type, and key delivery milestones.
- **Detailed Timeline:** Each shipment card can be expanded to show a step-by-step timeline of its journey, from pickup to injection.
- **Status Indicators:** Clear visual cues for overall shipment status and individual timeline nodes (e.g., On Time, Delayed).
- **Real-time Data:** A "Refresh Data" button allows users to fetch the latest shipment information on-demand.
- **Responsive Design:** The interface is optimized for a seamless experience on both desktop and mobile devices.

## Tech Stack

This project is built with a modern, component-based architecture.

*   **Framework:** [Next.js](https://nextjs.org/) (using the App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Library:** [React](https://reactjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Component Library:** [ShadCN UI](https://ui.shadcn.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Data Source:** Google Sheets (consumed as a public CSV file)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm (or yarn/pnpm) installed on your machine.

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/your-username/shipment-journey-tracker.git
    ```
2.  Install NPM packages:
    ```sh
    npm install
    ```
3.  Run the development server:
    ```sh
    npm run dev
    ```
4.  Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
