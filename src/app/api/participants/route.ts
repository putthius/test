import { NextResponse } from "next/server";

const SHEET_ID = "135wR_67Ggnp9UF0MaajgYKwh5j2m6MR8Wsp7FQ4LbBc";
const API_KEY = "AIzaSyCzX5zihWLYf72v8F6eMq7xZMOqgrgzp0c";
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

// 🧠 In-memory cache
const cache: {
  [key: string]: {
    timestamp: number;
    participants: {
      filterValue: string;
      name: string;
      role: string;
      title: string;
      givenName: string;
      familyName: string;
      dietary: string;
      medical: string;
      tshirt: string;
      projectTitle: string;
      projectCategory: string;
      checkedIn: boolean;
    }[];
  };
} = {};


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const competitionType = url.searchParams.get("conference");
    const filterValue = url.searchParams.get("filterValue");

    if (!competitionType || !filterValue) {
      return NextResponse.json(
        { error: "Missing competitionType or filterValue parameter" },
        { status: 400 }
      );
    }

    const cacheKey = `${competitionType}-${filterValue}`;
    const now = Date.now();

    // ✅ Serve from cache if valid
    // if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    //   return NextResponse.json({ participants: cache[cacheKey].participants });
    // }

    const sheetName =
      competitionType === "ICYS" ? "ICYS Participants" : "KVIS-ISF Participants";

    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets(properties,data.rowData.values.formattedValue,data.rowData.values.effectiveFormat.backgroundColor)&key=${API_KEY}`;

    console.log("🔹 Fetching participants from:", apiUrl);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error("❌ Failed to fetch participants:", await response.text());
      throw new Error("❌ Failed to fetch participants from Google Sheets");
    }

    const data = await response.json();
    const sheet = data.sheets.find(
      (s: { properties: { title?: string } }) =>
        s.properties.title === sheetName
    );

    if (!sheet || !sheet.data || sheet.data.length === 0) {
      throw new Error(`❌ Sheet "${sheetName}" does not contain any grid data.`);
    }

    let lastFilterValue = "";

    interface SheetRowValue {
      formattedValue?: string;
      effectiveFormat?: {
        backgroundColor?: {
          red?: number;
          green?: number;
          blue?: number;
        };
      };
    }

    const participants = sheet.data[0].rowData
      ?.map((row: { values?: SheetRowValue[] }) => {
        const values = row.values || [];

        if (values[0]?.formattedValue) {
          lastFilterValue = values[0].formattedValue;
        }

        const backgroundColor =
          values[4]?.effectiveFormat?.backgroundColor || {};
        const isCheckedIn =
          backgroundColor.green === 1.0 &&
          backgroundColor.red === undefined &&
          backgroundColor.blue === undefined;

        return {
          filterValue: lastFilterValue,
          name: `${values[3]?.formattedValue || ""}`.trim(),
          role: values[1]?.formattedValue || "",
          title: values[2]?.formattedValue || "",
          givenName: values[3]?.formattedValue || "",
          familyName: values[4]?.formattedValue || "",
          dietary: values[5]?.formattedValue || "",
          medical: values[6]?.formattedValue || "",
          tshirt: values[7]?.formattedValue || "",
          projectTitle: values[8]?.formattedValue || "",
          projectCategory: values[9]?.formattedValue || "",
          checkedIn: isCheckedIn,
        };
      })
      .filter((p: { filterValue: string }) => p.filterValue === filterValue) || [];

    // ✅ Store result in cache
    cache[cacheKey] = {
      timestamp: now,
      participants,
    };

    return NextResponse.json({ participants });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Error fetching participants data" },
      { status: 500 }
    );
  }
}
