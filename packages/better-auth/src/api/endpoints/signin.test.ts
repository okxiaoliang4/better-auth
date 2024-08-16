import { describe, it, expect } from "bun:test";
import { getTestInstance } from "../../test-utils/test-instance";

describe("signIn", async () => {
	const auth = await getTestInstance();
	it("should work", async () => {
		const res = await auth.api.signUpOAuth({
			body: {
				provider: "google",
				data: {
					firstName: "email",
				},
			},
		});
	});
});
