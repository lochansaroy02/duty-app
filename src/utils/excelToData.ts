import * as XLSX from 'xlsx';

/**
 * Parses an Excel or CSV file and returns an array of objects.
 * Handles any headers dynamically.
 */
export const parseExcel = <T = any>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;

                // 1. Read the workbook
                // 'type: binary' handles Excel, and 'xlsx' internal logic handles CSV automatically
                const workbook = XLSX.read(data, { type: 'binary' });

                // 2. Get the first sheet name
                const firstSheetName = workbook.SheetNames[0];

                // 3. Get the worksheet
                const worksheet = workbook.Sheets[firstSheetName];

                // 4. Convert sheet to JSON (Array of Objects)
                // header: 1 would give an array of arrays, but default gives objects
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as T[];

                resolve(jsonData);
            } catch (error) {
                reject(new Error("Failed to parse file. Ensure it is a valid Excel or CSV."));
            }
        };

        reader.onerror = () => reject(new Error("File reading error."));

        // Read as binary string to support various formats
        reader.readAsBinaryString(file);
    });
};