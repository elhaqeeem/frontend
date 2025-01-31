import { AuthServiceClient } from "./grpc/auth_grpc_web_pb";
import { LoginRequest } from "./grpc/auth_pb";

const client = new AuthServiceClient("http://localhost:50052", null, {
  "grpc-web-text": true,
});

export const loginGrpc = (username, password) => {
  const request = new LoginRequest();
  request.setUsername(username);
  request.setPassword(password);

  return new Promise((resolve, reject) => {
    client.login(request, null, (err, response) => {
      if (err) {
        console.error("gRPC Error:", err);
        reject(err.message || "Login failed");
      } else {
        resolve(response);
      }
    });
  });
};
