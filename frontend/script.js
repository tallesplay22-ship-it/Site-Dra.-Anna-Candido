const form = document.querySelector("#appointment-form");
const dateInput = document.querySelector("#appointment-date");
const timeSelect = form.elements.time;
const messageBox = document.querySelector("#form-message");
const submitButton = form.querySelector('button[type="submit"]');
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
const whatsappNumber = "5532991439408";

const appointmentTimes = [
  ["09:00", "9h"], ["10:00", "10h"], ["11:00", "11h"],
  ["12:00", "12h"], ["13:00", "13h"], ["14:00", "14h"],
  ["15:00", "15h"], ["16:00", "16h"]
];

function localDateString(date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

dateInput.min = localDateString(new Date());

function loadAvailableTimes() {
  timeSelect.replaceChildren(new Option("Selecione um horário", "", true, true));
  timeSelect.options[0].disabled = true;

  if (!dateInput.value) return;

  const selectedDate = new Date(`${dateInput.value}T12:00:00`);
  const day = selectedDate.getDay();
  if (day === 0 || day === 6) {
    timeSelect.replaceChildren(new Option("Escolha um dia útil", "", true, true));
    timeSelect.options[0].disabled = true;
    return;
  }

  for (const [value, label] of appointmentTimes) {
    timeSelect.add(new Option(label, value));
  }
}

dateInput.addEventListener("change", loadAvailableTimes);

form.elements.phone.addEventListener("input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
  const match = digits.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  event.target.value = !match[2]
    ? match[1]
    : `(${match[1]}${match[1].length === 2 ? ") " : ""}${match[2]}${match[3] ? `-${match[3]}` : ""}`;
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  mainNav.classList.toggle("is-open", !isOpen);
});

mainNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }
});

function createWhatsAppUrl(appointment) {
  const date = new Date(`${appointment.date}T12:00:00`).toLocaleDateString("pt-BR");
  const message = [
    "Olá, Dra. Anna Flávia! Gostaria de solicitar um agendamento.",
    "",
    `Responsável: ${appointment.name}`,
    `WhatsApp para retorno: ${appointment.phone}`,
    `Pet: ${appointment.petName}`,
    `Atendimento: ${appointment.service}`,
    `Data desejada: ${date}`,
    `Horário desejado: ${appointment.time}`,
    `Observações: ${appointment.notes || "Sem observações"}`,
    "",
    "Aguardo a confirmação do horário."
  ].join("\n");

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  messageBox.className = "form-message";
  messageBox.replaceChildren();
  submitButton.disabled = true;
  submitButton.textContent = "Enviando solicitação...";

  const formData = new FormData(form);
  const appointment = Object.fromEntries(formData.entries());
  const whatsappUrl = createWhatsAppUrl(appointment);

  try {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Não foi possível enviar sua solicitação.");
    }

    messageBox.textContent = result.message;
    messageBox.classList.add("is-visible", "is-success");
    window.location.assign(whatsappUrl);
  } catch (error) {
    messageBox.textContent = error.message || "Não foi possível conectar ao servidor. Tente novamente.";
    messageBox.classList.add("is-visible", "is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Solicitar consulta <span aria-hidden="true">↗</span>';
  }
});
