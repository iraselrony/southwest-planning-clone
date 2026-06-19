import Link from "next/link";

export default function NotFound() {
	return (
		<html lang="en-GB">
			<body
				style={{
					fontFamily: "Montserrat, sans-serif",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					margin: 0,
					padding: "0 24px",
					textAlign: "center",
				}}
			>
				<h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
				<p style={{ fontSize: "1.25rem", color: "#555" }}>
					The page you are looking for cannot be found.
				</p>
				<Link
					href="/"
					style={{
						marginTop: 24,
						padding: "12px 24px",
						border: "1px solid #000",
						textDecoration: "none",
						color: "#000",
					}}
				>
					Go to homepage
				</Link>
			</body>
		</html>
	);
}
