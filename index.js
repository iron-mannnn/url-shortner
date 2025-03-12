//Node JS Server File Main
import { createServer } from "http";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const PORT = 3000;
const DATA_FILE = path.join("data", "links.json");

//Creating serverFile Function Starts
const serverFile = async (res, filePath, contentType) => {
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("404 Page Not Found");
  }
};
//Creating serverFile Function Ends

//Data Folder Function Starts
const loadLinks = async () => {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {};
    }
    throw error;
  }
};
//Data Folder Function Ends

// saveLinks Function Starts
const saveLinks = async (links) => {
  await writeFile(DATA_FILE, JSON.stringify(links));
};
// saveLinks Function Ends

//My Server Part Starts
const server = createServer(async (req, res) => {
  //GET Method Starts
  if (req.method === "GET") {
    if (req.url === "/") {
      return serverFile(res, path.join("dist", "index.html"), "text/html");
    } else if (req.url === "/style.css") {
      return serverFile(res, path.join("dist", "style.css"), "text/css");
    } else if (req.url === "/app.js") {
      return serverFile(res, path.join("dist", "app.js"), "text/js");
    } else if (req.url === "/links") {
      const links = await loadLinks();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(links));
    } else {
      const links = await loadLinks();
      const shortCode = req.url.slice(1);
      if (links[shortCode]) {
        res.writeHead(302, { location: links[shortCode] });
        return res.end();
      }
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Shortened URL is not found");
    }
  }
  //GET Method Ends

  //POST Method Starts
  if (req.method === "POST" && req.url === "/shorten") {
    //Data Folder Starts
    const links = await loadLinks();
    //Data Folder Ends

    let body = "";
    req.on("data", (chunk) => (body += chunk));

    req.on("end", async () => {
      //   console.log(body);
      const { url, shortCode } = JSON.parse(body);

      if (!url) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("URL is required");
      }

      // Checking Duplicate Data Starts
      const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

      if (links[finalShortCode]) {
        res.writeHead(400, { "Content-Type": "text/html" });
        return res.end("Short code already exists. Please choose another.");
      }

      links[finalShortCode] = url;
      await saveLinks(links);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, shortCode: finalShortCode }));

      // Checking Duplicate Data Ends
    });
  }
  //POST Method Ends
});
//My Server Part Ends

//My Server Listen Starts
server.listen(PORT, () =>
  console.log(`Server is running at http://localhost:${PORT}`)
);
//My Server Listen Ends
