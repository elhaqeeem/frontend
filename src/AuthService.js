import { AuthServiceClient } from './grpc/auth_grpc_web_pb'; // Ensure correct path
import { LoginRequest } from './grpc/auth_pb';

const API_URL = "http://localhost:50052"; // Your backend URL

export const loginGrpc = (username, password) => {
  return new Promise((resolve, reject) => {
    const client = new AuthServiceClient(API_URL);
    const request = new LoginRequest();
    request.setUsername(username);
    request.setPassword(password);

    client.login(request, {}, (err, response) => {
      if (err) {
        reject(new Error(err.message || "Login failed"));
      } else {
        resolve(response); // Returns the `LoginResponse` object
      }
    });
  });
};
