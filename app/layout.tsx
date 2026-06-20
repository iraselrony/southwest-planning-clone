import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Self-hosted Montserrat. next/font/google downloads the font files at build
// time and serves them from the same origin as the site, eliminating the
// runtime dependency on fonts.googleapis.com / fonts.gstatic.com. The
// `--font-montserrat` CSS variable is applied to <body> in globals.css so the
// Webflow CSS (which references `font-family: Montserrat`) picks up the
// self-hosted version.
const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	display: "swap",
	variable: "--font-montserrat",
});

export const metadata: Metadata = {
	title: {
		default: "South West Planning Consultancy | Planning Consultants Southwest",
		template: "%s",
	},
	description:
		"South West Planning is an independent practice based in the West Country and providing planning and design consultancy services throughout the area",
	metadataBase: new URL("https://www.southwestplanningconsultancy.co.uk"),
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en-GB" className={montserrat.variable}>
			<head>
				{/* Webflow global stylesheet, served from /public preserving original path */}
				<link
					rel="stylesheet"
					href="/cdn.prod.website-files.com/62c2cea31ea6c6cc6f1800b3/css/franks-fantabulous-site-7-7d884cdc156fc.8b2ffb3ba.css"
					type="text/css"
				/>
				{/* Favicon (Webflow-hosted original) */}
				<link
					rel="shortcut icon"
					href="/cdn.prod.website-files.com/62c2cea31ea6c6cc6f1800b3/62c2d00bb44ea9e5b19495e1_32x32.png"
				/>
				<meta
					name="google-site-verification"
					content="cO_yBP4EppZBRT-Ni8hJ2_nCcpQ1H3bcTOQqnmGh7AE"
				/>
			</head>
			<body>
				{children}
				{/* Google Tag Manager (preserved from original) */}
				<Script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-R7H0V9MLPD"
					strategy="afterInteractive"
				/>
				<Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-R7H0V9MLPD');
        `}</Script>
				{/* jQuery (preserved from original) */}
				<Script
					src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js"
					strategy="afterInteractive"
					integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
					crossOrigin="anonymous"
				/>
				{/* Webflow runtime — three chunks, hosted at the original CDN.
            These power the slider, scroll animations, and nav. */}
				<Script
					src="/cdn.prod.website-files.com/62c2cea31ea6c6cc6f1800b3/js/franks-fantabulous-site-7-7d884cdc156fc.schunk.4a394eb5af8156f2.js"
					strategy="afterInteractive"
				/>
				<Script
					src="/cdn.prod.website-files.com/62c2cea31ea6c6cc6f1800b3/js/franks-fantabulous-site-7-7d884cdc156fc.schunk.68f82d66e67d7bab.js"
					strategy="afterInteractive"
				/>
				<Script
					src="/cdn.prod.website-files.com/62c2cea31ea6c6cc6f1800b3/js/franks-fantabulous-site-7-7d884cdc156fc.47f57903.71c58d6fd48b5bce.js"
					strategy="afterInteractive"
				/>
			</body>
		</html>
	);
}
