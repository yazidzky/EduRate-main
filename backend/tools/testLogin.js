import http from "http";

const data = JSON.stringify({ nim_nip: "ADMIN001", password: "password" });

const options = {
  hostname: "localhost",
  port: Number(process.env.PORT) || 5002,
  path: "/api/auth/login",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log("STATUS", res.statusCode);
    console.log("BODY", body);
  });
});

req.on("error", (err) => {
  console.error("Request error", err);
});

req.write(data);
req.end();
