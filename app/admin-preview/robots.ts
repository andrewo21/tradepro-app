// Prevent indexing of the private admin-preview route
export default function robots() {
  return {
    rules: { userAgent: "*", disallow: "/admin-preview" },
  };
}
