const express = require("express");
const { BlobServiceClient } = require("@azure/storage-blob");
const { ClientSecretCredential } = require("@azure/identity");
// Set up the credentials
const tenantId = "";
const clientId = "";
const clientSecret = "";
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
// Create a BlobServiceClient or QueueServiceClient instance
const blobAccountUrl = "";
const blobServiceClient = new BlobServiceClient(blobAccountUrl, credential);
const containerName = "";
// Set up the express app
const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (_, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // List blobs in the container
    const blobs = [];
    const base64 = [];
    const texts = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      const blobClient = containerClient.getBlobClient(blob.name);
      const buffer = await blobClient.downloadToBuffer();
      if (blob.name.lastIndexOf(".jpg") > -1) {
        base64.push(buffer.toString("base64"));
      }
      if (blob.name.lastIndexOf(".txt") > -1) {
        texts.push(buffer.toString());
      }
      blobs.push(blob.name);
    }
    // const imagehtml = `<img src="data:image/jpg;base64,${base64}" />`;
    res.send(`
<h1>Azure Storage AD integration example</h1>
<h2>Blobs in ${containerName} container:</h2>
<ul>
${blobs.map((blob) => `<li>${blob}</li>`).join("")}
</ul>
${base64.map((base) => `<img src="data:image/jpg;base64,${base}" />`).join("")}
${texts.map((text) => `<p>${text}</p>`).join("")}
`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
