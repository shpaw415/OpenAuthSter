// swift-tools-version: 6.0
import PackageDescription

let package = Package(
	name: "OpenAuthster",
	platforms: [
		.iOS(.v16),
		.macOS(.v13),
	],
	products: [
		.library(name: "OpenAuthster", targets: ["OpenAuthster"]),
	],
	targets: [
		.target(name: "OpenAuthster"),
		.testTarget(
			name: "OpenAuthsterTests",
			dependencies: ["OpenAuthster"]
		),
	]
)
