import { z } from "zod";
import { createAuthEndpoint } from "../call";
import { APIError } from "better-call";
import { parseState } from "../../utils/state";
import { parseJWT } from "oslo/jwt";

export const callbackOAuth = createAuthEndpoint(
	"/callback/:id",
	{
		method: "GET",
		query: z.object({
			state: z.string(),
			code: z.string(),
			code_verifier: z.string().optional(),
		}),
	},
	async (c) => {
		const provider = c.options.oAuthProviders?.find(
			(p) => p.id === c.params.id,
		);
		if (!provider || provider.type !== "oauth2") {
			c.logger.error("Oauth provider with id", c.params.id, "not found");
			throw new APIError("NOT_FOUND");
		}
		const tokens = await provider.provider.validateAuthorizationCode(
			c.query.code,
			c.query.code_verifier || "",
		);

		if (tokens.idToken) {
			const user = parseJWT(tokens.idToken);
			console.log({ user });
		} else {
		}

		if (!tokens) {
			c.logger.error("Code verification failed");
			throw new APIError("UNAUTHORIZED");
		}
		const { callbackURL } = parseState(c.query.state);
		if (!callbackURL) {
			c.logger.error("Callback URL not found");
			throw new APIError("FORBIDDEN");
		}
		c.setHeader("Location", callbackURL);
		throw new APIError("FOUND");
	},
);
