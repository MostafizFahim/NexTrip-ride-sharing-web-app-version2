// src/API/localStorageAPI.js
const localStorageAPI = {
  // Initialize sample data for users only
  init: () => {
    // Sample users
    if (!localStorage.getItem("users")) {
      const sampleUsers = [
        {
          id: 1,
          fullName: "Test User",
          userName: "testuser",
          email: "test@example.com",
          password: "password123",
          userType: "Passenger",
          role: "user",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          fullName: "Admin User",
          userName: "adminuser",
          email: "waliullah@trusticar.com",
          password: "admin123",
          userType: "Driver",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("users", JSON.stringify(sampleUsers));
    }
  },

  // Simulate axios post method
  post: (url, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Handle login
          if (url === "user/login") {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const user = users.find(
              (u) => u.email === data.email && u.password === data.password
            );

            if (user) {
              const userData = { ...user };
              delete userData.password;

              resolve({
                data: {
                  token: "fake-jwt-token-" + Date.now(),
                  user: userData,
                },
              });
            } else {
              reject({
                response: {
                  data: "Invalid email or password",
                },
              });
            }
          }
          // Handle registration
          else if (url === "user/register") {
            const users = JSON.parse(localStorage.getItem("users") || "[]");

            // Check if user already exists
            const existingUser = users.find((u) => u.email === data.email);
            if (existingUser) {
              reject({
                response: {
                  data: "User has already Register...",
                },
              });
              return;
            }

            const newUser = {
              id: Date.now(),
              ...data,
              role: "user",
              createdAt: new Date().toISOString(),
            };

            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));

            const userData = { ...newUser };
            delete userData.password;

            resolve({
              data: "Registration successful! Please login.",
            });
          } else {
            // For other endpoints, reject or handle as needed
            reject({
              response: {
                data: "Endpoint not implemented in localStorageAPI",
              },
            });
          }
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  // Simulate axios get method (minimal implementation)
  get: (url) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject({
          response: {
            data: "GET method not implemented for this endpoint in localStorageAPI",
          },
        });
      }, 300);
    });
  },

  // Simulate axios put method (minimal implementation)
  put: (url, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject({
          response: {
            data: "PUT method not implemented for this endpoint in localStorageAPI",
          },
        });
      }, 300);
    });
  },

  // Simulate axios delete method (minimal implementation)
  delete: (url) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject({
          response: {
            data: "DELETE method not implemented for this endpoint in localStorageAPI",
          },
        });
      }, 300);
    });
  },
};

// Initialize sample data when this module is imported
localStorageAPI.init();

export default localStorageAPI;
