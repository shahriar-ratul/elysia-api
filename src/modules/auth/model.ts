// Model define the data structure and validation for the request and response
import { t } from "elysia";

// Define a DTO for Elysia validation
export const signInBody = t.Object({
  username: t.String(),
  password: t.String(),
});

// Define it as TypeScript type
export type signInBody = typeof signInBody.static;

// Repeat for other models
export const signInResponse = t.Object({
  username: t.String(),
  token: t.String(),
});

export type signInResponse = typeof signInResponse.static;

export const signInInvalid = t.Literal("Invalid username or password");
export type signInInvalid = typeof signInInvalid.static;
