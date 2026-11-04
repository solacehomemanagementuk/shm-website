const allowedMethods = new Set(["GET", "HEAD", "POST"]);
const allowedRoute = /^(?:api\/auth\/(?:register\/(?:landlord|tenant|staff)|login\/(?:landlord|tenant|staff)|verify-email|resend-otp|session|logout)|account\/(?:landlord|tenant|staff))$/;

const response = (statusCode, error) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify({ error })
});

export const handler = async (event) => {
  const backendAddress = process.env.SHM_BACKEND_URL;
  const proxySecret = process.env.PROXY_SHARED_SECRET;
  if (!backendAddress || !proxySecret) {
    console.error("SHM API proxy configuration is missing SHM_BACKEND_URL or PROXY_SHARED_SECRET.");
    return response(503, "The SHM authentication service is not configured.");
  }

  let backend;
  try {
    backend = new URL(backendAddress);
  } catch {
    console.error("SHM API proxy configuration contains an invalid SHM_BACKEND_URL.");
    return response(503, "The SHM authentication service is not configured.");
  }
  if (backend.protocol !== "https:" || backend.pathname !== "/" || backend.search || backend.hash) {
    console.error("SHM API proxy configuration requires an HTTPS origin without a path.");
    return response(503, "The SHM authentication service URL is invalid.");
  }

  const mappedPath = event.path?.startsWith("/.netlify/functions/auth-proxy/")
    ? event.path.slice("/.netlify/functions/auth-proxy/".length)
    : event.path || "";
  const route = (event.queryStringParameters?.path || mappedPath).replace(/^\/+/, "");
  if (!allowedMethods.has(event.httpMethod) || !allowedRoute.test(route)) {
    return response(404, "The requested authentication route was not found.");
  }

  const target = new URL(route, backend.origin);
  const query = new URLSearchParams();
  const suppliedQuery = event.multiValueQueryStringParameters || event.queryStringParameters || {};
  for (const [name, value] of Object.entries(suppliedQuery)) {
    if (name === "path") continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (typeof item === "string") query.append(name, item);
    }
  }
  target.search = query.toString();

  const incomingHeaders = Object.fromEntries(
    Object.entries(event.headers || {}).map(([name, value]) => [name.toLowerCase(), value])
  );
  const headers = new Headers({ "x-shm-proxy-secret": proxySecret });
  const clientIp = incomingHeaders["x-nf-client-connection-ip"];
  if (clientIp && /^[0-9a-fA-F:.]+$/.test(clientIp)) {
    headers.set("x-shm-client-ip", clientIp);
  }
  for (const name of ["accept", "content-type", "cookie", "origin"]) {
    if (incomingHeaders[name]) headers.set(name, incomingHeaders[name]);
  }

  let body;
  if (event.body && !["GET", "HEAD"].includes(event.httpMethod)) {
    body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : event.body;
  }

  try {
    const upstream = await fetch(target, {
      method: event.httpMethod,
      headers,
      body,
      cache: "no-store",
      redirect: "manual"
    });
    const responseHeaders = {};
    for (const name of [
      "cache-control",
      "content-security-policy",
      "content-type",
      "location",
      "referrer-policy",
      "retry-after",
      "strict-transport-security",
      "x-content-type-options",
      "x-frame-options"
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders[name] = value;
    }
    const cookies = upstream.headers.getSetCookie?.();
    if (cookies?.length === 1) {
      responseHeaders["set-cookie"] = cookies[0];
    } else if (!cookies?.length) {
      const cookie = upstream.headers.get("set-cookie");
      if (cookie) responseHeaders["set-cookie"] = cookie;
    }
    const result = {
      statusCode: upstream.status,
      headers: responseHeaders,
      body: event.httpMethod === "HEAD" ? "" : await upstream.text()
    };
    if (cookies?.length > 1) result.multiValueHeaders = { "set-cookie": cookies };
    return result;
  } catch (error) {
    console.error("SHM API proxy request failed:", error?.cause?.code || error?.name || "upstream request error");
    return response(502, "The SHM authentication service is unavailable. Please try again later.");
  }
};
