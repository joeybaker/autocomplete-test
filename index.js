const { get } = require("axios");
const http = require("http");
const qs = require("querystring");

// FIXME: hardcoding key is bad
const PORT = 3001;
const queryUrl =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyCG00MA21tlOtLvoVnj6j7rkjwdAp2dxz8&input=";

const server = http.createServer(async (req, res) => {
  // TODO: this is not robust checking
  const { q } = qs.decode(req.url.replace("/api?", ""));
  try {
    const { data } = await get(queryUrl + q);
    // to show loading state
    setTimeout(() => {
      res.writeHead(200, { "Content-Type": "application/json" });
      // FIXME: silly to convert from string to object to string
      res.end(JSON.stringify(data));
    }, 300);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end({ error: e.toString() });
  }
});
server.listen(PORT);
