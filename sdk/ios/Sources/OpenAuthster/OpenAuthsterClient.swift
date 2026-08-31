import AuthenticationServices
import CryptoKit
import Foundation
import Security

public struct OpenAuthsterConfig: Sendable {
	public var issuer: URL
	public var clientID: String
	public var redirectURI: URL

	public init(issuer: URL, clientID: String, redirectURI: URL) {
		self.issuer = issuer
		self.clientID = clientID
		self.redirectURI = redirectURI
	}
}

public struct OpenAuthsterTokens: Sendable, Codable {
	public var access: String
	public var refresh: String?
	public var expiresAt: Date?
}

public enum OpenAuthsterError: Error, Sendable {
	case invalidResponse
	case missingCode
	case cancelled
	case keychain
	case http(Int)
}

public final class OpenAuthsterClient: NSObject, ASWebAuthenticationPresentationContextProviding, @unchecked Sendable {
	private let config: OpenAuthsterConfig
	private let session: URLSession
	private let keychainService: String
	private var authSession: ASWebAuthenticationSession?
	private var presentationAnchor: ASPresentationAnchor?

	public init(config: OpenAuthsterConfig, session: URLSession = .shared) {
		self.config = config
		self.session = session
		self.keychainService = "openauthster.\(config.clientID)"
	}

	public var isAuthenticated: Bool {
		(try? loadTokens())?.access.isEmpty == false
	}

	public func accessToken() throws -> String? {
		try loadTokens()?.access
	}

	@MainActor
	public func login(provider: String? = nil, anchor: ASPresentationAnchor) async throws {
		let verifier = Self.randomURLSafe(32)
		let challenge = Self.sha256Base64URL(verifier)
		let state = Self.randomURLSafe(16)
		var components = URLComponents(
			url: config.issuer.appending(path: "authorize"),
			resolvingAgainstBaseURL: false
		)!
		var items: [URLQueryItem] = [
			URLQueryItem(name: "client_id", value: config.clientID),
			URLQueryItem(name: "redirect_uri", value: config.redirectURI.absoluteString),
			URLQueryItem(name: "response_type", value: "code"),
			URLQueryItem(name: "code_challenge", value: challenge),
			URLQueryItem(name: "code_challenge_method", value: "S256"),
			URLQueryItem(name: "state", value: state),
		]
		if let provider {
			items.append(URLQueryItem(name: "provider", value: provider))
		}
		components.queryItems = items
		guard let url = components.url else { throw OpenAuthsterError.invalidResponse }

		let callback = try await withCheckedThrowingContinuation { (cont: CheckedContinuation<URL, Error>) in
			let session = ASWebAuthenticationSession(
				url: url,
				callbackURLScheme: config.redirectURI.scheme
			) { callbackURL, error in
				if let error {
					cont.resume(throwing: error)
					return
				}
				guard let callbackURL else {
					cont.resume(throwing: OpenAuthsterError.cancelled)
					return
				}
				cont.resume(returning: callbackURL)
			}
			session.presentationContextProvider = self
			session.prefersEphemeralWebBrowserSession = true
			self.authSession = session
			self.presentationAnchor = anchor
			if !session.start() {
				cont.resume(throwing: OpenAuthsterError.cancelled)
			}
		}
		try await handleCallback(callback, verifier: verifier)
	}

	public func handleCallback(_ url: URL, verifier: String) async throws {
		guard let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems,
		      let code = items.first(where: { $0.name == "code" })?.value
		else {
			throw OpenAuthsterError.missingCode
		}
		var request = URLRequest(url: config.issuer.appending(path: "token"))
		request.httpMethod = "POST"
		request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
		let body: [String: String] = [
			"grant_type": "authorization_code",
			"client_id": config.clientID,
			"code": code,
			"redirect_uri": config.redirectURI.absoluteString,
			"code_verifier": verifier,
		]
		request.httpBody = body
			.map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
			.joined(separator: "&")
			.data(using: .utf8)
		let (data, response) = try await session.data(for: request)
		guard let http = response as? HTTPURLResponse else { throw OpenAuthsterError.invalidResponse }
		guard (200 ..< 300).contains(http.statusCode) else { throw OpenAuthsterError.http(http.statusCode) }
		let payload = try JSONDecoder().decode(TokenResponse.self, from: data)
		try save(
			OpenAuthsterTokens(
				access: payload.access_token,
				refresh: payload.refresh_token,
				expiresAt: payload.expires_in.map { Date().addingTimeInterval(TimeInterval($0)) }
			)
		)
	}

	public func logout() throws {
		try deleteTokens()
	}

	public func getPublicSession() async throws -> Data {
		guard let token = try loadTokens()?.access else { throw OpenAuthsterError.missingCode }
		var request = URLRequest(
			url: config.issuer.appending(path: "session/public/\(config.clientID)")
		)
		request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
		let (data, response) = try await session.data(for: request)
		guard let http = response as? HTTPURLResponse, (200 ..< 300).contains(http.statusCode) else {
			throw OpenAuthsterError.http((response as? HTTPURLResponse)?.statusCode ?? 0)
		}
		return data
	}

	public func presentationAnchor(for _: ASWebAuthenticationSession) -> ASPresentationAnchor {
		presentationAnchor ?? ASPresentationAnchor()
	}

	private struct TokenResponse: Decodable {
		var access_token: String
		var refresh_token: String?
		var expires_in: Int?
	}

	private static func randomURLSafe(_ bytes: Int) -> String {
		var buffer = [UInt8](repeating: 0, count: bytes)
		_ = SecRandomCopyBytes(kSecRandomDefault, bytes, &buffer)
		return Data(buffer).base64EncodedString()
			.replacingOccurrences(of: "+", with: "-")
			.replacingOccurrences(of: "/", with: "_")
			.replacingOccurrences(of: "=", with: "")
	}

	private static func sha256Base64URL(_ value: String) -> String {
		let digest = SHA256.hash(data: Data(value.utf8))
		return Data(digest).base64EncodedString()
			.replacingOccurrences(of: "+", with: "-")
			.replacingOccurrences(of: "/", with: "_")
			.replacingOccurrences(of: "=", with: "")
	}

	private func save(_ tokens: OpenAuthsterTokens) throws {
		let data = try JSONEncoder().encode(tokens)
		let query: [String: Any] = [
			kSecClass as String: kSecClassGenericPassword,
			kSecAttrService as String: keychainService,
			kSecAttrAccount as String: "tokens",
		]
		SecItemDelete(query as CFDictionary)
		var add = query
		add[kSecValueData as String] = data
		guard SecItemAdd(add as CFDictionary, nil) == errSecSuccess else {
			throw OpenAuthsterError.keychain
		}
	}

	private func loadTokens() throws -> OpenAuthsterTokens? {
		let query: [String: Any] = [
			kSecClass as String: kSecClassGenericPassword,
			kSecAttrService as String: keychainService,
			kSecAttrAccount as String: "tokens",
			kSecReturnData as String: true,
			kSecMatchLimit as String: kSecMatchLimitOne,
		]
		var item: CFTypeRef?
		let status = SecItemCopyMatching(query as CFDictionary, &item)
		if status == errSecItemNotFound { return nil }
		guard status == errSecSuccess, let data = item as? Data else {
			throw OpenAuthsterError.keychain
		}
		return try JSONDecoder().decode(OpenAuthsterTokens.self, from: data)
	}

	private func deleteTokens() throws {
		let query: [String: Any] = [
			kSecClass as String: kSecClassGenericPassword,
			kSecAttrService as String: keychainService,
			kSecAttrAccount as String: "tokens",
		]
		let status = SecItemDelete(query as CFDictionary)
		guard status == errSecSuccess || status == errSecItemNotFound else {
			throw OpenAuthsterError.keychain
		}
	}
}
