import axios from "axios";
import { parseStringPromise } from "xml2js";
import crypto from "crypto";

export async function fetchJobsFromUrl(feedUrl) {
  try {
    console.log("Fetching feed:", feedUrl);
    const res = await axios.get(feedUrl, { timeout: 20000 });
    let xml = res.data;

    // --- Sanitize XML ---
    xml = xml
      .replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;")
      .replace(/\s[a-zA-Z0-9:-]+=>/g, "")
      .replace(/[\u0000-\u001F]+/g, "")
      .replace(/<\/?br[^>]*>/gi, "")
      .replace(/<\/?hr[^>]*>/gi, "");

    // --- Parse XML safely ---
    const parsed = await parseStringPromise(xml, {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
      trim: true,
      strict: false,
    });

    // --- Extract feed items ---
    let items = [];
    if (parsed?.rss?.channel?.item) {
      const maybe = parsed.rss.channel.item;
      items = Array.isArray(maybe) ? maybe : [maybe];
    } else if (parsed?.feed?.entry) {
      const maybe = parsed.feed.entry;
      items = Array.isArray(maybe) ? maybe : [maybe];
    } else {
      const findItems = (obj) => {
        for (const key of Object.keys(obj || {})) {
          if (
            key.toLowerCase().endsWith("item") ||
            key.toLowerCase().endsWith("entry")
          ) {
            const it = obj[key];
            return Array.isArray(it) ? it : [it];
          } else if (typeof obj[key] === "object") {
            const found = findItems(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };
      items = findItems(parsed) || [];
    }

    if (!items.length) {
      console.warn(`⚠️ No items found in ${feedUrl}`);
      return [];
    }

    // --- Normalize and guarantee externalId ---
    const normalized = items.map((it, index) => {
      const title = it.title?.["_"] || it.title || "";
      const link =
        typeof it.link === "string"
          ? it.link
          : it.link?.href ||
            it.link?.["#"] ||
            (Array.isArray(it.link) ? it.link[0]?.href || it.link[0] : "") ||
            "";
      const description = it.description || it.summary || it.content || "";
      const pubDate = it.pubDate || it.published || it.updated || null;

      // Try multiple possible identifiers
      let externalId =
        it.guid?.["_"] ||
        it.guid?.["#"] ||
        it.guid ||
        it.id ||
        link ||
        (title && title.substring(0, 80));

      // Fallback: generate deterministic hash if still missing
      if (!externalId || externalId.trim() === "") {
        externalId = crypto
          .createHash("md5")
          .update(feedUrl + "|" + title + "|" + link + "|" + index)
          .digest("hex");
      }

      return {
        externalId: String(externalId).trim(),
        title: String(title).trim(),
        link: String(link).trim(),
        description,
        pubDate: pubDate ? new Date(pubDate) : null,
        raw: it,
      };
    });

    console.log(`Parsed ${normalized.length} items from ${feedUrl}`);
    return normalized;
  } catch (err) {
    console.error(`Error parsing feed ${feedUrl}:`, err.message);
    return [];
  }
}
