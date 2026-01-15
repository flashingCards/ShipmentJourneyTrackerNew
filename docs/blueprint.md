# **App Name**: Shipment Pulse

## Core Features:

- Data Fetching and Parsing: Fetch shipment data from the provided CSV link and parse it for display.
- Shipment Card Display: Display each shipment as a card with essential details on top, including scancode, company, ERP status, service type, injection port, country, pickup dates (ideal and actual), gateway connection dates (ideal and actual), injection dates (ideal and actual), delivery dates (ideal and actual), overall flag, node available day, and node flag.
- Expandable Shipment Details: Allow users to expand each shipment card to view a detailed status view with ideal and actual times for each node the shipment has reached using data from columns A to J and AN to BH, excluding columns K to AM.
- Status Indicators: Visually represent the 'over flag' and 'node flag' statuses using color-coded indicators (Red for late, Green for on time).
- Refresh Data: Implement a refresh button that reloads the shipment data from the CSV link to reflect the most current status.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke trust and reliability.
- Background color: Very light gray (#F5F5F5) for a clean, modern look.
- Accent color: Light orange (#FF9800) to highlight key information and action items.
- Body and headline font: 'PT Sans' (sans-serif) for clear, readable text.
- Use clear, concise icons to represent shipment status and actions.
- Cards should have a clear visual hierarchy, with important information easily accessible.
- Use subtle animations for card expansion/collapse and data refreshing to provide user feedback.