// functions/api/[...path].ts

interface Env {
  AUTH_TOKEN: string;
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

// ✅ 新版 Pages Functions 写法：直接解构 { request, env, params }
export async function onRequest({
  request,
  env,
  params,
}: {
  request: Request;
  env: Env;
  params: { path?: string[] };
}): Promise<Response> {
  // 重构目标路径（去掉 /api 前缀）
  const targetPath = `/${params.path?.join("/") || ""}`;

  const authorization = request.headers.get("Authorization");
  const xGoogApiKey = request.headers.get("x-goog-api-key");

  // 鉴权
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return jsonResponse(401, "Bearer token is required.");
  }
  const authToken = authorization.split(" ")[1];
  if (authToken !== env.AUTH_TOKEN) {
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
