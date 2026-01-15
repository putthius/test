import { NextResponse } from "next/server";

const SHEET_ID = "135wR_67Ggnp9UF0MaajgYKwh5j2m6MR8Wsp7FQ4LbBc"; // Google Sheet ID
const API_KEY = "AIzaSyCzX5zihWLYf72v8F6eMq7xZMOqgrgzp0c"; // API Key
const RANGE = "Sheet2!A:A"; // Fetch only the first column (School Names)

export async function GET() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );

        if (!response.ok) throw new Error("❌ Failed to fetch data from Google Sheets");

        const data = await response.json();
        console.log("✅ Schools Fetched:", data);

        const schools = data.values ? data.values.flat().filter(Boolean) : []; // Extracting school names

        return NextResponse.json({ schools });
    } catch (error) {
        console.error("❌ API Error:", error);
        return NextResponse.json({ error: "Error fetching school names" }, { status: 500 });
    }
}
