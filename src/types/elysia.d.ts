import type { Logger } from "../utils/logger";
import type { AppAbility } from "../utils/permissions";

declare module "elysia" {
  interface Context {
    logger: Logger;
    requestId: string;
    admin?: { id: bigint };
    user?: { id: bigint };
    session?: { token: string };
    ability?: AppAbility;
  }
}
