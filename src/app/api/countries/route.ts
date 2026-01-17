import { NextResponse } from "next/server";

const SHEET_ID = "1IeO6icNhcHcCeE7Yflmg7J6iTa2HsuQrkIINpjK4PL4"; // Replace with actual Google Sheet ID
const API_KEY = "AIzaSyCzX5zihWLYf72v8F6eMq7xZMOqgrgzp0c"; // Replace with your API Key

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const competitionType = url.searchParams.get("competitionType");

        if (!competitionType) {
            return NextResponse.json({ error: "Missing competitionType parameter" }, { status: 400 });
        }

        const sheetName = competitionType === "ICYS" ? "ICYS Participants" : "KVIS-ISF Participants";
        const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!A:A?key=${API_KEY}`;
        
        console.log("🔹 Fetching from URL:", apiUrl);

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            console.error("❌ Failed to fetch data:", await response.text());
            throw new Error("❌ Failed to fetch data from Google Sheets");
        }

        const data = await response.json();
        const filters = [...new Set(data.values.slice(1).flat())]; // Remove header & get unique values

        return NextResponse.json({ filters });
    } catch (error) {
        console.error("❌ API Error:", error);
        return NextResponse.json({ error: "Error fetching filters" }, { status: 500 });
    }
}
