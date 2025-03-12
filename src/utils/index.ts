export async function urlToBase64String(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer(); // Get binary data as ArrayBuffer
    const uint8Array = new Uint8Array(arrayBuffer);

    // Convert binary data to a Base64 string
    let binaryString = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    return btoa(binaryString); // Encode binary string to Base64
  } catch (error) {
    throw new Error(`Failed to fetch and convert file: ${error}`);
  }
};

export function base64StringToBlob(base64: string, filename: string): Blob | undefined {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    return blob;
  } catch (error) {
    console.error("Error converting base64 to file:", error);
  }
};