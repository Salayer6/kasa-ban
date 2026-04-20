// Kasa-ban Database Backend
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this code into Code.gs
// 4. Click Deploy > New deployment
// 5. Select type "Web app"
// 6. Execute as: Me, Who has access: Anyone
// 7. Copy the Web App URL and place it in the Kasa-ban frontend environment variables.

const SHEET_NAME = "Tasks";

// Handle GET requests (Reads)
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
      newSheet.appendRow(["id", "title", "status", "assignedTo", "description", "updatedAt"]);
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const tasks = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue; // Skip empty rows without ID
        
        const task = {};
        for (let j = 0; j < headers.length; j++) {
            task[headers[j]] = row[j];
        }
        tasks.push(task);
    }
    
    return ContentService.createTextOutput(JSON.stringify(tasks))
      .setMimeType(ContentService.MimeType.JSON)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1'); // This is not for JSON but usually we add headers like this:
    /* 
       Apps Script handles CORS differently. 
       Usually we don't need to add headers manually for JSON output as it's handled by Google.
    */
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests (Writes/Updates/Deletes)
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error("Sheet 'Tasks' not found - please make a GET request first to initialize.");
    }
    
    // We expect a payload like: { action: 'sync', tasks: [...] }
    const postData = JSON.parse(e.postData.contents);
    
    if (postData.action === 'sync') {
      const tasksToSync = postData.tasks;
      
      // Clear the sheet except headers
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }
      
      if (tasksToSync && tasksToSync.length > 0) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const rows = [];
        
        for (const task of tasksToSync) {
            const row = [];
            for (const header of headers) {
                row.push(task[header] || "");
            }
            rows.push(row);
        }
        
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Tasks synced successfully" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message, stack: error.stack }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper to handle CORS for some environments
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}
