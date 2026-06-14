import fs from "fs";
import path from "path";

const html = fs.readFileSync(
  path.join(
    process.cwd(),
    "../mockups/stitch_super_carnes_e_commerce_platform/cat_logo_de_productos_super_carnes/code.html",
  ),
  "utf8",
);
const match = html.match(/src="(data:image\/png;base64,[^"]+)"/);
if (match) {
  const b64 = match[1].split(",")[1];
  fs.writeFileSync(path.join(process.cwd(), "public/logo.png"), Buffer.from(b64, "base64"));
  console.log("Logo extracted");
}
