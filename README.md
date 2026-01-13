# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Google Sheets API v4

## Google Sheets API Configuration

This application uses Google Sheets API v4 to store and manage appointments and user data. To set up the integration:

1. **Get a Google Sheets API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sheets API
   - Go to Credentials and create an API Key
   - (Optional) Restrict the API key to Google Sheets API for security

2. **Set up your Google Sheets:**
   - **Users Sheet (Users_Appointments)**: Create a Google Sheet with columns: `email` (A), `password` (B), `spreadhseetid` (C)
   - **Main Appointments Sheet**: The main appointments sheet with columns: `Patient Name` (A), `Email` (B), `Phone Number` (C), `Patient Sympton Report URL` (D), `date` (E), `start_time` (F), `status` (G)
   - **User Appointments Sheets**: Each user should have their own appointments sheet (referenced by `spreadhseetid` in the Users sheet) with the same structure as the main appointments sheet
   
   **Automatic Sync Feature:**
   - The application automatically monitors the main appointments sheet for new or updated rows
   - When a new appointment is added, the system:
     1. Extracts the email from the appointment row
     2. Matches it with the email in the Users_Appointments sheet
     3. Retrieves the corresponding `spreadhseetid`
     4. Adds the appointment to that user's spreadsheet
   - Sync runs automatically every 30 seconds in the background

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory with:
   ```env
   VITE_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
   VITE_USERS_SHEET_ID=your_users_sheet_id_or_url_here
   VITE_MAIN_APPOINTMENTS_SHEET_ID=your_main_appointments_sheet_id_or_url_here
   ```
   
   **Environment Variables:**
   - `VITE_GOOGLE_SHEETS_API_KEY`: Your Google Sheets API key
   - `VITE_USERS_SHEET_ID`: The Users_Appointments sheet ID (contains: email, password, spreadhseetid)
   - `VITE_MAIN_APPOINTMENTS_SHEET_ID`: The main appointments sheet ID (monitored for new appointments)
   
   You can use either the full Google Sheets URL or just the Spreadsheet ID:
   - Full URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Spreadsheet ID: `{SPREADSHEET_ID}`
   
   **Note:** If `VITE_MAIN_APPOINTMENTS_SHEET_ID` is not set, the system will use a default hardcoded ID.

4. **Share your Google Sheets:**
   - Make sure your Google Sheets are accessible (either public or shared with the service account)
   - For public access: File → Share → "Anyone with the link" → Viewer
   - For API key access: The API key must have access to read/write the sheets

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
