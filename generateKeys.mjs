import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256", {
    extractable: true,
});

const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

// For Convex environment variables, the key needs to be on a single line
// Replace newlines with spaces (as per Convex Auth documentation)
const privateKeySingleLine = privateKey.trimEnd().replace(/\n/g, " ");

console.log(
    "=== Copy these values to your Convex Dashboard Environment Variables ==="
);
console.log(
    "\n1. JWT_PRIVATE_KEY (copy the entire value below, including quotes):"
);
console.log(JSON.stringify(privateKeySingleLine));
console.log("\n2. JWKS (copy the entire value below):");
console.log(jwks);
console.log(
    "\n=== Alternative: Copy without quotes (paste directly into Convex dashboard) ==="
);
console.log("\nJWT_PRIVATE_KEY:");
console.log(privateKeySingleLine);
console.log("\nJWKS:");
console.log(jwks);
