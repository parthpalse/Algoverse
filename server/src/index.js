import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./config/db.js";

const port = parseInt(process.env.PORT || "5000", 10);

async function main() {
  await connectDb();
  app.listen(port, () => {
    console.log(`AlgoVerse API listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
