const { get } = require("axios");
const http = require("http");
const qs = require("querystring");
const LRU = require("quick-lru");

// FIXME: hardcoding key is bad
const PORT = 3001;
// FIXME: Google is returns results based on IP address. Proxying will throw off these results.
const queryUrl =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyCG00MA21tlOtLvoVnj6j7rkjwdAp2dxz8&input=";
const queryCache = new LRU({ maxSize: 1000 });

const server = http.createServer(async (req, res) => {
  // TODO: this is not robust checking
  const { q } = qs.decode(req.url.replace("/api?", ""));
  if (queryCache.has(q)) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(queryCache.get(q));
    return;
  }

  try {
    const { data } = await get(queryUrl + q);
    // to show loading state
    setTimeout(() => {
      res.writeHead(200, { "Content-Type": "application/json" });
      // FIXME: silly to convert from string to object to string
      const stringData = JSON.stringify(data);
      res.end(stringData);
      queryCache.set(q, stringData);
    }, 300);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end({ error: e.toString() });
  }
});
server.listen(PORT);
