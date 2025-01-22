import { requestUrl } from "obsidian";

export const fetchUrl = async (url: string) => {
  try {
    const response = await requestUrl({
      url: url,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      }
    });

    if (response.status === 200) {
      return response.text;
    } else {
      throw new Error(`HTTP error ${response.status}`);
    }
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
};