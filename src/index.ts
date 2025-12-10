// src/index.ts
export interface Env {
  AUTH_TOKEN: string; // 鉴权密钥
}

function jsonResponse(
  status_code: number,
  message: string,
  body?: any
): Response {
  const data = JSON.stringify({
    header: { status_code: status_code, message: message },
    body: body,
  });
  return new Response(data, {
    status: status_code,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const xGoogApiKey = request.headers.get("x-goog-api-key");

    // 鉴权
    const authorization = request.headers.get("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return jsonResponse(401, "Bearer token is required.");
    }
    const authToken = authorization.split(" ")[1];
    if (authToken !== env.AUTH_TOKEN) {
      return jsonResponse(401, "Token is invalid.");
    }

    // 检查 google api key
    if (!xGoogApiKey) {
      return jsonResponse(400, "Header `x-goog-api-key` is required.");
    }

    // 构造 Google API 请求
    const googleApiUrl = new URL(
      `https://generativelanguage.googleapis.com${path}`
    );
    const body = request.body;
    try {
      const response = await fetch(googleApiUrl.toString(), {
        method: request.method,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": xGoogApiKey,
        },
        body,
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      return jsonResponse(500, "Proxy failed, detail: " + error);
    }
  },
};
