/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap";
import "@payloadcms/next/css";

async function serverFunction(args: Parameters<ServerFunctionClient>[0]) {
	"use server";
	return handleServerFunctions({
		...args,
		config,
		importMap,
	});
}

const Layout = ({ children }: { children: React.ReactNode }) => (
	<RootLayout
		config={config}
		importMap={importMap}
		serverFunction={serverFunction}
	>
		{children}
	</RootLayout>
);

export default Layout;
