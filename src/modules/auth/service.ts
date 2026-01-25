// Service handle business logic, decoupled from Elysia controller

import * as AuthModel from "./model";

// If the class doesn't need to store a property,
// you may use `abstract class` to avoid class allocation
export abstract class Auth {
  static async signIn({ username, password }: AuthModel.signInBody) {
    // TODO: Implement database query
    // Example implementation:
    // const user = await db.user.findUnique({ where: { username } })

    // Placeholder implementation
    const user: any = null;

    if (!user || !(await Bun.password.verify(password, user?.password || "")))
      // You can throw an HTTP error directly
      throw new Error("Invalid username or password");

    return {
      username,
      token: "placeholder-token", // TODO: await generateAndSaveTokenToDB(user.id)
    };
  }
}
