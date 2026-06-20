/* Client-side interceptor for the Webflow-style contact forms.
 *
 * The two forms (one on /contact, one on each /services/* page) submit via
 * `method="get"` to the current URL. We intercept the submit event, POST the
 * data as JSON to /api/contact, and route the success/error response into
 * the existing `.w-form-done` / `.w-form-fail` divs the Webflow CSS already
 * styles.
 *
 * Field names accept both naming conventions:
 *   Contact page form:    First-name / Last-name / Email / Phone / Message
 *   Service page forms:   First-name-2 / Last-name-2 / Email-2 / Phone-2 / Message-2
 *
 * Loaded as a <script> in app/layout.tsx so it runs on every page. The
 * `data-contact-form` attribute is added to the form elements by the
 * server-side `_lib/page.ts` rewriter.
 */
(() => {
	function getField(form, ...names) {
		for (const n of names) {
			const el = form.querySelector(`[name="${n}"]`);
			if (el && typeof el.value === "string" && el.value.trim()) {
				return el.value.trim();
			}
		}
		return "";
	}

	function getSource(form) {
		// The server-side rewriter tags each contact form with the page slug.
		const tagged = form.getAttribute("data-contact-form");
		if (tagged) return tagged;
		// Fallback: derive from the form id.
		const id = form.getAttribute("id") || form.getAttribute("name") || "";
		if (/Services/i.test(id)) return "service-page";
		return "contact-page";
	}

	function showSuccess(form) {
		const done = form.parentElement?.querySelector(".w-form-done");
		const fail = form.parentElement?.querySelector(".w-form-fail");
		if (done) done.style.display = "block";
		if (fail) fail.style.display = "none";
		form.style.display = "none";
	}

	function showError(form, message) {
		const done = form.parentElement?.querySelector(".w-form-done");
		const fail = form.parentElement?.querySelector(".w-form-fail");
		if (fail) {
			fail.style.display = "block";
			const text = fail.querySelector(".body-display");
			if (text && message) text.textContent = message;
		}
		if (done) done.style.display = "none";
		const submit = form.querySelector('input[type="submit"]');
		if (submit) {
			submit.removeAttribute("disabled");
			submit.value = submit.getAttribute("data-original-value") || "Send now";
		}
	}

	function attach(form) {
		if (form.__contactFormAttached) return;
		form.__contactFormAttached = true;

		// Stash the original submit button label so we can restore it on error.
		const submit = form.querySelector('input[type="submit"]');
		if (submit && submit.value) {
			submit.setAttribute("data-original-value", submit.value);
		}

		form.addEventListener("submit", async (event) => {
			event.preventDefault();

			const first = getField(form, "First-name", "First-name-2");
			const last = getField(form, "Last-name", "Last-name-2");
			const name = [first, last].filter(Boolean).join(" ").trim();
			const email = getField(form, "Email", "Email-2");
			const phone = getField(form, "Phone", "Phone-2");
			const message = getField(form, "Message", "Message-2");
			const source = getSource(form);

			// Client-side validation (server re-validates).
			if (!name || !email || !message) {
				showError(
					form,
					"Please fill in your name, email, and message before sending.",
				);
				return;
			}

			if (submit) {
				submit.setAttribute("disabled", "disabled");
				submit.value = "Sending\u2026";
			}

			try {
				const res = await fetch("/api/contact", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name, email, phone, message, source }),
				});
				const data = await res.json().catch(() => ({}));
				if (res.ok && data.ok) {
					showSuccess(form);
					form.reset();
				} else {
					const msg =
						(data && (data.error || (data.errors && data.errors.join(", ")))) ||
						"Something went wrong. Please try again or email us directly.";
					showError(form, msg);
				}
			} catch (e) {
				showError(
					form,
					"Network error. Please check your connection and try again.",
				);
			}
		});
	}

	function init() {
		const forms = document.querySelectorAll(
			"form[data-contact-form], form.form, form.w-form",
		);
		forms.forEach(attach);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
