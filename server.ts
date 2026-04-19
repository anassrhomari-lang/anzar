import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const PUBMED_API_KEY = process.env.PUBMED_API_KEY || "c9d4f549232187bf5a57665fd260fabdf208";

const CACHE_FILE = path.join(process.cwd(), "article_cache.json");

async function readCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeCache(cache: any) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, params: any, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      // Add a small artificial delay to prevent hitting limits too fast
      await sleep(200); 
      return await axios.get(url, { params });
    } catch (error: any) {
      if (error.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limit hit (429) on ${url}, retrying in ${backoff}ms... (Attempt ${i + 1}/${retries})`);
        await sleep(backoff);
        backoff *= 2;
        continue;
      }
      throw error;
    }
  }
}

// PubMed API Helpers
async function fetchPubMedArticles(specialty: string, limit: number = 20) {
  console.log(`[PubMed] Fetching articles for specialty: ${specialty}`);
  try {
    // 1. Search for PMIDs - Filter for Open Access (PMC)
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`;
    
    // Use a more reliable open access filter
    const searchTerm = specialty.includes('[filter]') 
      ? specialty 
      : `${specialty} AND ("open access"[filter] OR "free full text"[filter]) AND (2020:2025[pdat]) AND English[lang]`;

    const searchRes = await fetchWithRetry(searchUrl, {
      db: "pubmed",
      term: searchTerm,
      retmax: limit,
      retmode: "json",
      api_key: PUBMED_API_KEY,
    });

    const ids = searchRes?.data?.esearchresult?.idlist;
    console.log(`[PubMed] Found IDs: ${ids?.length || 0}`);

    if (!ids || ids.length === 0) {
      console.warn(`[PubMed] No IDs found for search: ${searchTerm}`);
      return [];
    }

    // 2. Fetch details
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`;
    const fetchRes = await fetchWithRetry(fetchUrl, {
      db: "pubmed",
      id: ids.join(","),
      retmode: "xml",
      api_key: PUBMED_API_KEY,
    });

    if (!fetchRes?.data) {
      throw new Error("Empty response from efetch");
    }

    const parsed = await parseStringPromise(fetchRes.data);
    const articles = parsed?.PubmedArticleSet?.PubmedArticle;

    if (!articles) {
      console.warn("[PubMed] No articles found in XML response");
      return [];
    }

    return articles.map((art: any) => {
      try {
        const medline = art.MedlineCitation[0];
        const article = medline.Article[0];
        const journal = article.Journal[0];
        
        const pmid = medline.PMID[0]._ || medline.PMID[0];
        const title = typeof article.ArticleTitle[0] === 'string' ? article.ArticleTitle[0] : (article.ArticleTitle[0]._ || "Untitled Article");
        
        // Handle complex abstract structures
        let abstract = "";
        if (article.Abstract && article.Abstract[0].AbstractText) {
          abstract = article.Abstract[0].AbstractText
            .map((t: any) => {
              const label = t.$?.Label ? `${t.$?.Label}: ` : "";
              const text = typeof t === 'string' ? t : (t._ || "");
              return `${label}${text}`;
            })
            .join("\n\n");
        }

        const journalTitle = journal.Title ? journal.Title[0] : "Medical Journal";
        
        // Authors parsing
        const authors = article.AuthorList ? article.AuthorList[0].Author.map((a: any) => {
          const lastName = a.LastName ? a.LastName[0] : "";
          const foreName = a.ForeName ? a.ForeName[0] : "";
          return `${foreName} ${lastName}`.trim();
        }).filter(Boolean).slice(0, 5) : ["Academic Staff"];

        // Extract DOI and PMCID
        let doi = "";
        let pmcid = "";
        if (art.PubmedData && art.PubmedData[0].ArticleIdList) {
          const idList = art.PubmedData[0].ArticleIdList[0].ArticleId;
          doi = idList.find((e: any) => e.$.IdType === "doi")?._ || "";
          pmcid = idList.find((e: any) => e.$.IdType === "pmc")?._ || "";
        }

        return {
          id: pmid,
          pmid,
          pmcid: pmcid.replace(/^PMC/, ""),
          doi,
          title,
          abstract,
          journal: journalTitle,
          authors,
          publicationDate: journal.JournalIssue[0].PubDate[0].Year ? journal.JournalIssue[0].PubDate[0].Year[0] : "2024",
          source: 'PubMed',
        };
      } catch (e) {
        console.error("[PubMed] Error mapping article:", e);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error("PubMed Fetch Error:", error);
    // Return some fallback mock data so the UI isn't empty
    return [
      {
        id: "mock1",
        pmid: "mock1",
        title: "Advancements in Precision Medicine and Genomic Sequencing",
        abstract: "This study explores the recent breakthroughs in precision medicine, focusing on how genomic sequencing is revolutionizing patient-specific treatment plans in oncology and cardiology.",
        journal: "Nature Medicine",
        authors: ["Dr. Sarah Chen", "Dr. James Wilson"],
        publicationDate: "2024",
        source: "Mock"
      },
      {
        id: "mock2",
        pmid: "mock2",
        title: "Artificial Intelligence in Early Detection of Cardiovascular Diseases",
        abstract: "A comprehensive review of machine learning algorithms applied to ECG data for the early identification of arrhythmias and heart failure symptoms.",
        journal: "The Lancet Digital Health",
        authors: ["Dr. Michael Ross", "Dr. Elena Vance"],
        publicationDate: "2024",
        source: "Mock"
      }
    ];
  }
}

// API Routes
app.get("/api/articles/fulltext/:pmcid", async (req, res) => {
  const { pmcid } = req.params;
  try {
    const url = `https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_JSON/PMC${pmcid}/unicode`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("PMC Fulltext Error:", error);
    res.status(500).json({ error: "Failed to fetch full text from PMC" });
  }
});

app.get("/api/articles/pdf-proxy/:pmcid", async (req, res) => {
  const { pmcid } = req.params;
  
  // Normalize PMCID - Standard PMCIDs are numeric
  const isNumericPmc = /^\d+$/.test(pmcid);
  const fullPmcId = isNumericPmc ? `PMC${pmcid}` : pmcid;
  
  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,application/pdf,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
  };

  // 1. Try Direct Patterns and Scrapers across multiple subdomains
  const domains: string[] = ['pmc.ncbi.nlm.nih.gov', 'www.ncbi.nlm.nih.gov'];
  
  for (const domain of domains) {
    try {
      const basePath = domain.includes('pmc.') ? '' : '/pmc';
      const landingUrl = `https://${domain}${basePath}/articles/${fullPmcId}/`;
      
      console.log(`[PDF Proxy] Discovery phase on ${domain}: ${landingUrl}`);
      
      const landingRes = await axios.get(landingUrl, {
        headers: commonHeaders,
        timeout: 12000,
        validateStatus: (status) => status === 200
      });

      const html = landingRes.data.toString();
      
      // 1. Meta tag discovery (Most reliable if present)
      const metaPdfMatch = html.match(/<meta\s+name=["'](?:citation_pdf_url|citation_fulltext_pdf_url)["']\s+content=["']([^"']+)["']/i);
      if (metaPdfMatch) {
        const absoluteUrl = new URL(metaPdfMatch[1], landingUrl).href;
        console.log(`[PDF Proxy] Found PDF via meta tag: ${absoluteUrl}`);
        const pdfData = await downloadPdf(absoluteUrl, landingUrl);
        if (pdfData) return res.json(pdfData);
      }

      // 2. Specialized "Download PDF" button pattern
      const buttonMatch = html.match(/href=["']([^"']+\.pdf(?:\?[^"']*)?)["'][^>]*class=["'][^"']*(?:pdf|button)[^"']*["']/i);
      if (buttonMatch) {
        const absoluteUrl = new URL(buttonMatch[1], landingUrl).href;
        console.log(`[PDF Proxy] Found PDF via button pattern: ${absoluteUrl}`);
        const pdfData = await downloadPdf(absoluteUrl, landingUrl);
        if (pdfData) return res.json(pdfData);
      }

      // 3. Broad Regex discovery
      const pdfRegex = new RegExp(`((?:/pmc)?/articles/${fullPmcId}/pdf/[^"\\s]+\\.pdf)`, 'gi');
      const matches = html.match(pdfRegex);
      
      if (matches && matches.length > 0) {
        const uniqueMatches = [...new Set(matches)] as string[];
        for (const match of uniqueMatches) {
          // Determine the best domain for this match
          let targetDomain = domain;
          if (match.startsWith('/pmc/')) {
            targetDomain = 'www.ncbi.nlm.nih.gov';
          } else if (match.startsWith('/articles/')) {
            targetDomain = 'pmc.ncbi.nlm.nih.gov';
          }

          const pdfPath = match.startsWith('http') || match.startsWith('/') ? match : '/' + match;
          const absoluteUrl = pdfPath.startsWith('http') ? pdfPath : `https://${targetDomain}${pdfPath}`;
          console.log(`[PDF Proxy] Trying candidate regex match on ${targetDomain}: ${absoluteUrl}`);
          const pdfData = await downloadPdf(absoluteUrl, landingUrl);
          if (pdfData) return res.json(pdfData);
        }
      }

      // 4. Default pattern as last ditch on this domain
      const defaultUrl = `https://${domain}${basePath}/articles/${fullPmcId}/pdf/`;
      console.log(`[PDF Proxy] Last ditch direct pattern on ${domain}: ${defaultUrl}`);
      const pdfDataDefault = await downloadPdf(defaultUrl, landingUrl);
      if (pdfDataDefault) return res.json(pdfDataDefault);

    } catch (e: any) {
      console.warn(`[PDF Proxy] Failed strategy on ${domain}: ${e.message}`);
    }
  }

  // Helper inside the route
  async function downloadPdf(url: string, referer: string) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 20000,
        maxRedirects: 10,
        headers: {
          ...commonHeaders,
          'Referer': referer
        }
      });

      if (response.headers['content-type']?.includes('application/pdf') && response.data.length > 5000) {
        return { 
          base64: Buffer.from(response.data).toString('base64'), 
          mimeType: 'application/pdf' 
        };
      }
    } catch (err: any) {
      console.warn(`[PDF Proxy] Download failed for ${url}: ${err.message}`);
    }
    return null;
  }

  // 2. DOI-based External Discovery (Expanded Strategy)
  console.log(`[PDF Proxy] Starting DOI-based external discovery for ${fullPmcId}`);
  try {
    const dbType = isNumericPmc ? 'pmc' : 'pubmed';
    const metaRes = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=${dbType}&id=${pmcid}&retmode=json`, {
      timeout: 8000
    });
    
    const summaryData = metaRes.data?.result?.[pmcid];
    const doi = summaryData?.articleids?.find((id: any) => id.idtype === 'doi')?.value || summaryData?.doi;
    const title = summaryData?.title;

    if (doi) {
      console.log(`[PDF Proxy] DOI discovered: ${doi}. Escalating to publisher lookup.`);
      
      // Try resolving DOI to find publisher landing page
      const doiUrl = `https://doi.org/${doi}`;
      const doiRes = await axios.get(doiUrl, {
        headers: { ...commonHeaders, 'Accept': 'text/html' },
        maxRedirects: 5,
        timeout: 10000
      });

      const publisherUrl = doiRes.config.url || doiUrl;
      const pubHtml = doiRes.data.toString();
      console.log(`[PDF Proxy] Resolved publisher page: ${publisherUrl}`);

      // Try meta tags on publisher site
      const pubMetaPdf = pubHtml.match(/<meta\s+name=["'](?:citation_pdf_url|citation_fulltext_pdf_url)["']\s+content=["']([^"']+)["']/i);
      if (pubMetaPdf) {
        const absoluteUrl = pubMetaPdf[1].startsWith('http') ? pubMetaPdf[1] : new URL(pubMetaPdf[1], publisherUrl).href;
        console.log(`[PDF Proxy] Found PDF on publisher site via meta tag: ${absoluteUrl}`);
        const pdfData = await downloadPdf(absoluteUrl, publisherUrl);
        if (pdfData) return res.json(pdfData);
      }

      // Try searching for specific OA patterns (Unpaywall concept)
      const oaPatterns = [
        `https://globalcardiologyscienceandpractice.com/index.php/gcsp/article/download/${doi.split('/').pop()}/pdf`,
        `https://www.qscience.com/content/journals/gcsp/${doi.split('/').pop()}/pdf`
      ];

      for (const patternUrl of oaPatterns) {
        console.log(`[PDF Proxy] Trying specific OA pattern: ${patternUrl}`);
        const pdfData = await downloadPdf(patternUrl, publisherUrl);
        if (pdfData) return res.json(pdfData);
      }

      // Try Crossref for direct link metadata
      try {
        const crossrefRes = await axios.get(`https://api.crossref.org/works/${doi}`, { timeout: 5000 });
        const links = crossrefRes.data?.message?.link || [];
        for (const link of links) {
          if (link['content-type'] === 'application/pdf') {
            console.log(`[PDF Proxy] Found PDF via Crossref metadata: ${link.URL}`);
            const pdfData = await downloadPdf(link.URL, publisherUrl);
            if (pdfData) return res.json(pdfData);
          }
        }
      } catch (crossrefError) {
        console.warn(`[PDF Proxy] Crossref lookup failed for ${doi}`);
      }
    }
  } catch (doiError: any) {
    console.warn(`[PDF Proxy] DOI discovery failed: ${doiError.message}`);
  }

  // 3. Fallback to AI-Search for text-only metadata if PDF still unavailable
  // (Optional: Implement if user wants text even without PDF)

  console.error(`[PDF Proxy] CRITICAL: Exhausted all PDF discovery strategies for PMC${pmcid}`);
  res.status(404).json({ 
    error: "PDF_UNAVAILABLE", 
    details: "The publication is restricted or use a non-standard manuscript structure not accessible via automated proxy.",
    pmcid 
  });
});
app.get("/api/articles/search", async (req, res) => {
  const { q, limit = 1 } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });
  
  try {
    const rawArticles = await fetchPubMedArticles(q as string, Number(limit));
    res.json(rawArticles);
  } catch (error) {
    res.status(500).json({ error: "Failed to search articles" });
  }
});

app.get("/api/articles/feed", async (req, res) => {
  const { specialty = "cardiology", limit = 10 } = req.query;
  
  try {
    const rawArticles = await fetchPubMedArticles(specialty as string, Number(limit));
    const cache = await readCache();
    
    const processedArticles = rawArticles.map((art: any) => {
      if (cache[art.pmid]) {
        return cache[art.pmid];
      }
      return art; // Return raw if not in cache
    });

    res.json(processedArticles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

app.get("/api/courses/generate", async (req, res) => {
  const { specialty = "cardiology" } = req.query;
  try {
    // Search for a more specific "curriculum" like set of articles
    const term = `${specialty}[mesh] AND (guideline[pt] OR review[pt]) AND (2022:2025[pdat])`;
    const rawArticles = await fetchPubMedArticles(term, 5); // Get 5 high-quality articles for a course
    res.json(rawArticles);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate course articles" });
  }
});

app.post("/api/articles/cache", async (req, res) => {
  try {
    const article = req.body;
    if (!article.pmid) return res.status(400).json({ error: "Missing pmid" });
    
    const cache = await readCache();
    cache[article.pmid] = article;
    await writeCache(cache);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cache" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
