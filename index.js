import express from "express";
import bodyParser from "body-parser";
import fs from "fs/promises";

const masterKey = "4VGP2DN-6EWM4SJ-N6FGRHV-Z3PR3TT";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Helper function to load JSON data from a file
async function loadJSON(filePath) {
  const data = await fs.readFile(filePath, "utf8");
  return JSON.parse(data);
}

app.get("/", (req, res) => {
  res.send(`Hello World!`);
});

app.get('/stores', async (req, res) => {
  const stores = await loadJSON("./stores.json");
  res.json(stores); // Adjust according to JSON structure
});

app.get('/banners', async (req, res) => {
  const banners = await loadJSON("./banners.json");
  res.json(banners); // Adjust according to JSON structure
});

app.get('/categories', async (req, res) => {
  const categories = await loadJSON("./categories.json");
  res.json(categories); // Adjust according to JSON structure
});

app.get('/items', async (req, res) => {
  const items = await loadJSON("./items.json");
  res.json(items); // Adjust according to JSON structure
});

app.get("/random", async (req, res) => {
  const items = await loadJSON("./items.json");
  const genRandom = Math.floor(Math.random() * items.items.length);
  const itemGen = items.items[genRandom];
  res.json(itemGen);
});

app.get("/items/:id", async (req, res) => {
  const items = await loadJSON("./items.json");
  const id = parseInt(req.params.id);
  const foundItem = items.items.find((item) => item.id === id);
  res.json(foundItem);
});

app.get("/banners/:id", async (req, res) => {
  const banners = await loadJSON("./banners.json");
  const id = parseInt(req.params.id);
  const foundItem = banners.banners.find((banner) => banner.idBanner === id);
  res.json(foundItem);
});

app.get("/filter", async (req, res) => {
  const items = await loadJSON("./items.json");
  const category = req.query.c;
  const foundType = items.items.filter((item) => item.itemCategory === category);
  res.json(foundType);
});

app.post("/items", async (req, res) => {
  const items = await loadJSON("./items.json");
  const newText = req.body.name;
  const newType = req.body.category;
  const newID = items.items.length + 1;

  const newItem = {
    id: newID,
    itemName: newText,
    itemCategory: newType,
  };

  items.items.push(newItem);

  await fs.writeFile("./items.json", JSON.stringify(items, null, 2), "utf8");

  res.json(newItem);
});

app.put("/items/:id", async (req, res) => {
  const items = await loadJSON("./items.json");
  const id = parseInt(req.params.id);
  const replacementItem = {
    id: id,
    itemName: req.body.name,
    itemCategory: req.body.category,
  };
  const searchIndex = items.items.findIndex((item) => item.id === id);

  if (searchIndex !== -1) {
    items.items[searchIndex] = replacementItem;
    await fs.writeFile("./items.json", JSON.stringify(items, null, 2), "utf8");
    res.json(replacementItem);
  } else {
    res.status(404).json({ error: "Item not found." });
  }
});


app.patch("/items/:id", async (req, res) => {
  const items = await loadJSON("./items.json");
  const id = parseInt(req.params.id);
  const existingItem = items.items.find((item) => item.id === id);
  
  if (!existingItem) {
    return res.status(404).json({ error: "Item not found." });
  }
  
  const replacementItem = {
    id: id,
    itemName: req.body.name || existingItem.itemName,
    itemCategory: req.body.category || existingItem.itemCategory,
  };
  
  const searchIndex = items.items.findIndex((item) => item.id === id);
  items.items[searchIndex] = replacementItem;
  await fs.writeFile("./items.json", JSON.stringify(items, null, 2), "utf8");
  
  res.json(replacementItem);
});

app.patch("/banners/:id", async (req, res) => {
  try {
    const banners = await loadJSON("./banners.json");
    const id = parseInt(req.params.id);
    
    // Find the banner by id
    const existingItem = banners.banners.find((banner) => banner.idBanner === id);
    
    // If the banner doesn't exist, return 404
    if (!existingItem) {
      return res.status(404).json({ error: "Item not found." });
    }

    // Create the replacement item, with fallback to existing data if fields are not provided
    const replacementItem = {
      idBanner: id,
      bannerName: req.body.name || existingItem.bannerName,
      bannerCategory: existingItem.bannerCategory, // Use existing category as it is not passed in request
      bannerImage: req.body.image || existingItem.bannerImage, // Fallback to the existing image if not provided
    };

    // Find the index of the existing item
    const searchIndex = banners.banners.findIndex((banner) => banner.idBanner === id);

    // Replace the existing item with the new item
    banners.banners[searchIndex] = replacementItem;

    // Write the updated data back to the JSON file
    await fs.writeFile("./banners.json", JSON.stringify(banners, null, 2), "utf8");

    // Send the updated item in the response
    res.json(replacementItem);
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/items/:id", async (req, res) => {
  const items = await loadJSON("./items.json");
  const id = parseInt(req.params.id);
  const searchIndex = items.items.findIndex((item) => item.id === id);

  if (searchIndex > -1) {
    items.items.splice(searchIndex, 1);
    await fs.writeFile("./items.json", JSON.stringify(items, null, 2), "utf8");
    res.sendStatus(200);
  } else {
    res.status(404).json({ error: "Item not found. No items were deleted." });
  }
});

app.delete("/items/all", async (req, res) => {
  const key = req.query.apiKey;
  if (key === masterKey) {
    await fs.writeFile("./items.json", JSON.stringify({ items: [] }, null, 2), "utf8");
    res.json({ message: "All items have been deleted." });
  } else {
    res.status(403).json({ error: "You aren't authorized to perform this function." });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
