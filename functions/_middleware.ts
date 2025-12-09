// functions/_middleware.ts

interface Env {
  AUTHTOKEN: string;
}

function jsonResponse(
  status_code: number,
  message: string,
  body?: any
): Response {
  return new Response(
    JSON.stringify({
      header: { status_code, message },
      body,
    }),
    {
      status: status_code,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function onRequest({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const url = new URL(request.url);

  // 只处理 /api/ 开头的请求
  if (!url.pathname.startsWith("/api/")) {
    // 非 API 请求：返回静态资源（或 404）
    return new Response("Not Found", { status: 404 });
  }

  // 提取目标路径（去掉 /api 前缀）
  const targetPath = url.pathname.replace(/^\/api/, "");

  const authorization = request.headers.get("Authorization");
  const xGoogApiKey = request.headers.get("x-goog-api-key");

  // 鉴权
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return jsonResponse(401, "Bearer token is required.");
  }
  const authToken = authorization.split(" ")[1];
  if (authToken !== env.AUTHTOKEN) {
    return jsonResponse(401, "Token is invalid.");
  }

  if (!xGoogApiKey) {
    return jsonResponse(400, "Header `x-goog-api-key` is required.");
  }

  const googleApiUrl = `https://generativelanguage.googleapis.com${targetPath}`;

  try {
    const proxyResponse = await fetch(googleApiUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": xGoogApiKey,
      },
      body: request.body,
    });

    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: proxyResponse.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return jsonResponse(
      500,
      "Proxy failed",
      error instanceof Error ? { message: error.message } : {}
    );
  }
}
