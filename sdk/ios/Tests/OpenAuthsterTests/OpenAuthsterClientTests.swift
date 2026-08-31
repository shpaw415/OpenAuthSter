import Foundation
import Testing
@testable import OpenAuthster

@Test func configStoresIssuer() {
	let client = OpenAuthsterClient(
		config: OpenAuthsterConfig(
			issuer: URL(string: "https://auth.example.com")!,
			clientID: "gpio_companion",
			redirectURI: URL(string: "gpio-companion://auth/callback")!
		)
	)
	#expect(client.isAuthenticated == false)
}
