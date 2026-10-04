// A public FormSubmit endpoint is expected here, not a secret/API key.
const ENDPOINT = "https://formsubmit.co/ajax/esskay400d@gmail.com";

export function initForm() {
  const form = document.getElementById("booking-form");
  const button = document.getElementById("submit-btn");
  const status = document.getElementById("form-status");
  const service = document.getElementById("contact-service");
  const originalButton = button.innerHTML;
  let sending = false;
  button.disabled = false;

  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      service.value = link.dataset.service;
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (form.elements._honey.value) return;
    sending = true;
    button.disabled = true;
    button.textContent = "Sending your enquiry…";
    form.setAttribute("aria-busy", "true");
    status.dataset.state = "pending";
    status.textContent = "Sending securely. Please wait…";
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error("Submission rejected");
      const result = await response.json();
      if (result.success !== true && result.success !== "true")
        throw new Error("Submission not confirmed");
      status.dataset.state = "success";
      status.textContent =
        "Thank you! Your enquiry has been received. We’ll contact you to arrange your discovery call.";
      form.reset();
    } catch {
      status.dataset.state = "error";
      status.replaceChildren(
        document.createTextNode(
          "We couldn’t confirm delivery. Your details are still here. Try again, or ",
        ),
      );
      const email = document.createElement("a");
      email.href = "mailto:esskay400d@gmail.com";
      email.className = "inline-link";
      email.textContent = "email us directly";
      status.append(email, document.createTextNode("."));
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.innerHTML = originalButton;
      form.removeAttribute("aria-busy");
    }
  });
}
