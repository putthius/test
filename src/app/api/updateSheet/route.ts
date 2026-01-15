import { google } from "googleapis";
import { NextResponse } from "next/server";
import googleCredentials from "../../api/google-credentials.json";
import { sheets_v4 } from "googleapis";

const SHEET_ID = "135wR_67Ggnp9UF0MaajgYKwh5j2m6MR8Wsp7FQ4LbBc";
const ICYS_SHEET_NAME = "ICYS Participants";
const KVIS_ISF_SHEET_NAME = "KVIS-ISF Participants";

const auth = new google.auth.GoogleAuth({
  credentials: googleCredentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function POST(request: Request) {
  try {
    const {
      corrections,
      selectedParticipants,
      competitionType,
      highlightGreen,
    }: {
      corrections?: {
        [key: string]: {
          name?: string;
          projectTitle?: string;
          projectCategory?: string;
        };
      };
      selectedParticipants?: string[];
      competitionType: string;
      highlightGreen?: boolean;
    } = await request.json();
    console.log({
      corrections,
      selectedParticipants,
      competitionType,
      highlightGreen,
    });
    if (!competitionType) {
      return NextResponse.json(
        { error: "Missing competition type" },
        { status: 400 }
      );
    }

    const SHEET_NAME =
      competitionType === "ICYS" ? ICYS_SHEET_NAME : KVIS_ISF_SHEET_NAME;
    const sheets = google.sheets({ version: "v4", auth });

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const sheet = meta.data.sheets?.find(
      (s) => s.properties?.title?.trim() === SHEET_NAME.trim()
    );
    if (!sheet || sheet.properties?.sheetId === undefined) {
      throw new Error(`Sheet "${SHEET_NAME}" not found or missing ID`);
    }
    const sheetId = sheet.properties.sheetId;

    const sheetValues = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
    });

    const rows: string[][] = sheetValues.data.values || [];
    const updateRequests: sheets_v4.Schema$Request[] = [];

    // 🛠 Apply field-wise corrections
    if (corrections) {
      for (const [fullName, fields] of Object.entries(corrections)) {
        const rowIndex = rows.findIndex(
          (row) =>
            `${(row[3] || "").trim()} ${(row[4] || "").trim()}` ===
            fullName.trim()
        );

        if (rowIndex !== -1) {
          const rowUpdates: sheets_v4.Schema$Request[] = [];
          if (fields.name) {
            rowUpdates.push({
              updateCells: {
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 10,
                  endColumnIndex: 11,
                },
                rows: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: fields.name || "" } },
                    ],
                  },
                ],
                fields: "userEnteredValue",
              },
            });
          }

          if (fields.projectTitle) {
            rowUpdates.push({
              updateCells: {
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 11, // Column I
                  endColumnIndex: 12,
                },
                rows: [
                  {
                    values: [
                      {
                        userEnteredValue: { stringValue: fields.projectTitle },
                      },
                    ],
                  },
                ],
                fields: "userEnteredValue",
              },
            });
          }

          if (fields.projectCategory) {
            rowUpdates.push({
              updateCells: {
                range: {
                  sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 12, // Column J
                  endColumnIndex: 13,
                },
                rows: [
                  {
                    values: [
                      {
                        userEnteredValue: {
                          stringValue: fields.projectCategory,
                        },
                      },
                    ],
                  },
                ],
                fields: "userEnteredValue",
              },
            });
          }

          updateRequests.push(...rowUpdates);
        } else {
          console.warn(`⚠️ Correction target not found: ${fullName}`);
        }
      }
    }

    // ✅ Highlight green if needed
    if (highlightGreen && selectedParticipants) {
      console.log("now highlighting")
      for (const fullName of selectedParticipants) {
        const rowIndex = rows.findIndex(
          (row) =>
            `${(row[3] || "").trim()} ${(row[4] || "").trim()}` ===
            fullName.trim()
        );

        if (rowIndex !== -1) {
          console.log("now turn to green");
          updateRequests.push({
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: rowIndex,
                endRowIndex: rowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: 10,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0, green: 1, blue: 0 },
                },
              },
              fields: "userEnteredFormat.backgroundColor",
            },
          });
          const timestamp = new Date().toLocaleString("en-GB", {
            timeZone: "Asia/Bangkok", // 🕒 Adjust your timezone
            hour12: false,
          });

          updateRequests.push({
            updateCells: {
              range: {
                sheetId,
                startRowIndex: rowIndex,
                endRowIndex: rowIndex + 1,
                startColumnIndex: 13, // Column L
                endColumnIndex: 14,
              },
              rows: [
                { values: [{ userEnteredValue: { stringValue: timestamp } }] },
              ],
              fields: "userEnteredValue",
            },
          });
        }
        else{
          console.log("not found");
        }
      }
    }

    // ✨ Apply changes
    if (updateRequests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests: updateRequests },
      });
      console.log("✅ Google Sheet updated.");
    } else {
      console.log("ℹ️ No updates needed.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
