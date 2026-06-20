/**
 * Site settings form (client). Single form with all fields, add/remove
 * for phone numbers, fixed 4 social platforms.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "../../_components/image-upload";

type SocialLinks = {
	instagram?: string;
	twitter?: string;
	linkedin?: string;
	facebook?: string;
};

type SettingsForForm = {
	logoUrl: string | null;
	companyName: string;
	companyTagline: string;
	address: string;
	phoneNumbers: string[];
	email: string;
	socialLinks: SocialLinks;
	registrationNumber: string;
	registeredOffice: string;
	footerText: string;
};

export function SettingsForm({ initial }: { initial: SettingsForForm }) {
	const router = useRouter();
	const [logoUrl, setLogoUrl] = useState<string | null>(initial.logoUrl);
	const [companyName, setCompanyName] = useState(initial.companyName);
	const [companyTagline, setCompanyTagline] = useState(
		initial.companyTagline,
	);
	const [address, setAddress] = useState(initial.address);
	const [phoneNumbers, setPhoneNumbers] = useState<string[]>(
		initial.phoneNumbers.length > 0
			? initial.phoneNumbers
			: [""],
	);
	const [email, setEmail] = useState(initial.email);
	const [socialLinks, setSocialLinks] = useState<SocialLinks>(
		initial.socialLinks,
	);
	const [registrationNumber, setRegistrationNumber] = useState(
		initial.registrationNumber,
	);
	const [registeredOffice, setRegisteredOffice] = useState(
		initial.registeredOffice,
	);
	const [footerText, setFooterText] = useState(initial.footerText);
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const [isPending, startTransition] = useTransition();

	async function save() {
		// Strip empty phone numbers + empty social links
		const cleanPhones = phoneNumbers.map((p) => p.trim()).filter(Boolean);
		const cleanSocial: SocialLinks = {};
		if (socialLinks.instagram?.trim())
			cleanSocial.instagram = socialLinks.instagram.trim();
		if (socialLinks.twitter?.trim())
			cleanSocial.twitter = socialLinks.twitter.trim();
		if (socialLinks.linkedin?.trim())
			cleanSocial.linkedin = socialLinks.linkedin.trim();
		if (socialLinks.facebook?.trim())
			cleanSocial.facebook = socialLinks.facebook.trim();

		const res = await fetch("/api/admin/settings", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				logoUrl,
				companyName: companyName.trim(),
				companyTagline: companyTagline.trim() || null,
				address: address.trim() || null,
				phoneNumbers: cleanPhones,
				email: email.trim() || null,
				socialLinks: cleanSocial,
				registrationNumber: registrationNumber.trim() || null,
				registeredOffice: registeredOffice.trim() || null,
				footerText: footerText.trim() || null,
			}),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			alert(
				`Save failed: ${err.error ?? res.statusText ?? "unknown"}`,
			);
			return;
		}
		setSavedAt(new Date());
		startTransition(() => router.refresh());
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				save();
			}}
			className="space-y-6"
		>
			{/* Company */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					Company
				</h2>
				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="companyName"
							className="block text-sm font-medium text-neutral-700"
						>
							Company name
						</label>
						<input
							id="companyName"
							type="text"
							required
							value={companyName}
							onChange={(e) => setCompanyName(e.target.value)}
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>
					<div>
						<label
							htmlFor="companyTagline"
							className="block text-sm font-medium text-neutral-700"
						>
							Tagline
						</label>
						<input
							id="companyTagline"
							type="text"
							value={companyTagline}
							onChange={(e) => setCompanyTagline(e.target.value)}
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
						<p className="mt-1 text-xs text-neutral-500">
							Short blurb shown on the homepage and as the
							default meta description.
						</p>
					</div>
					<div>
						<label
							htmlFor="logoUrl"
							className="block text-sm font-medium text-neutral-700"
						>
							Logo
						</label>
						<ImageUpload value={logoUrl} onChange={setLogoUrl} />
					</div>
					<div>
						<label
							htmlFor="address"
							className="block text-sm font-medium text-neutral-700"
						>
							Address
						</label>
						<textarea
							id="address"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							rows={3}
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>
				</div>
			</section>

			{/* Contact */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					Contact
				</h2>
				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-neutral-700"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
						<p className="mt-1 text-xs text-neutral-500">
							Default recipient for the contact form.
						</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-neutral-700">
							Phone numbers
						</label>
						<div className="mt-1 space-y-2">
							{phoneNumbers.map((phone, idx) => (
								<div
									key={idx}
									className="flex items-center gap-2"
								>
									<input
										type="tel"
										value={phone}
										onChange={(e) => {
											const next = [...phoneNumbers];
											next[idx] = e.target.value;
											setPhoneNumbers(next);
										}}
										placeholder="01392 984 206"
										className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
									/>
									<button
										type="button"
										onClick={() =>
											setPhoneNumbers(
												phoneNumbers.filter(
													(_, i) => i !== idx,
												),
											)
										}
										className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
									>
										Remove
									</button>
								</div>
							))}
						</div>
						<button
							type="button"
							onClick={() =>
								setPhoneNumbers([...phoneNumbers, ""])
							}
							className="mt-2 rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
						>
							+ Add phone number
						</button>
					</div>
				</div>
			</section>

			{/* Social */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					Social links
				</h2>
				<div className="mt-4 space-y-3">
					{(["instagram", "twitter", "linkedin", "facebook"] as const).map(
						(platform) => (
							<div key={platform}>
								<label
									htmlFor={`social-${platform}`}
									className="block text-sm font-medium capitalize text-neutral-700"
								>
									{platform}
								</label>
								<input
									id={`social-${platform}`}
									type="url"
									value={socialLinks[platform] ?? ""}
									onChange={(e) =>
										setSocialLinks({
											...socialLinks,
											[platform]: e.target.value,
										})
									}
									placeholder={`https://${platform}.com/...`}
									className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
								/>
							</div>
						),
					)}
				</div>
			</section>

			{/* Registration */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					Registration
				</h2>
				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="registrationNumber"
							className="block text-sm font-medium text-neutral-700"
						>
							Company number
						</label>
						<input
							id="registrationNumber"
							type="text"
							value={registrationNumber}
							onChange={(e) =>
								setRegistrationNumber(e.target.value)
							}
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>
					<div>
						<label
							htmlFor="registeredOffice"
							className="block text-sm font-medium text-neutral-700"
						>
							Registered office
						</label>
						<textarea
							id="registeredOffice"
							value={registeredOffice}
							onChange={(e) =>
								setRegisteredOffice(e.target.value)
							}
							rows={3}
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>
					<div>
						<label
							htmlFor="footerText"
							className="block text-sm font-medium text-neutral-700"
						>
							Footer blurb
						</label>
						<textarea
							id="footerText"
							value={footerText}
							onChange={(e) => setFooterText(e.target.value)}
							rows={3}
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>
				</div>
			</section>

			{/* Save */}
			<div className="sticky bottom-0 -mx-6 border-t border-neutral-200 bg-white px-6 py-3">
				<div className="flex items-center justify-between">
					<div className="text-sm text-neutral-600">
						{isPending
							? "Saving…"
							: savedAt
								? `Saved at ${savedAt.toLocaleTimeString()}`
								: "Unsaved changes"}
					</div>
					<button
						type="submit"
						disabled={isPending}
						className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
					>
						{isPending ? "Saving…" : "Save"}
					</button>
				</div>
			</div>
		</form>
	);
}
