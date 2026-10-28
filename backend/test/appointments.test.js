const assert = require("node:assert/strict");
const test = require("node:test");
const { validateAppointment } = require("../src/controllers/appointmentsController");

function nextWeekday() {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 1);
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return date.toISOString().slice(0, 10);
}

function validAppointment(overrides = {}) {
  return {
    name: "Maria da Silva",
    phone: "(32) 99999-0000",
    petName: "Luna",
    service: "Consulta veterinária",
    date: nextWeekday(),
    time: "10:00",
    consent: "on",
    ...overrides
  };
}

test("aceita uma solicitação válida", () => {
  assert.equal(validateAppointment(validAppointment()), null);
});

test("rejeita corpo ausente ou em formato incorreto", () => {
  assert.match(validateAppointment(null), /formulário válido/i);
  assert.match(validateAppointment([]), /formulário válido/i);
});

test("rejeita solicitação sem consentimento", () => {
  assert.match(validateAppointment(validAppointment({ consent: "off" })), /concordar/i);
});

test("rejeita serviço não previsto", () => {
  assert.match(validateAppointment(validAppointment({ service: "Serviço inválido" })), /tipo de consulta/i);
});

test("rejeita data inexistente", () => {
  assert.match(validateAppointment(validAppointment({ date: "2030-02-30" })), /data válida/i);
});

test("rejeita agendamento em fim de semana", () => {
  assert.match(validateAppointment(validAppointment({ date: "2030-06-08" })), /segunda a sexta/i);
});

test("rejeita horários fora da agenda", () => {
  assert.match(validateAppointment(validAppointment({ time: "20:00" })), /horário disponível/i);
});

test("rejeita campos com conteúdo de tamanho excessivo", () => {
  assert.match(validateAppointment(validAppointment({ petName: "P".repeat(81) })), /Revise os nomes/i);
  assert.match(validateAppointment(validAppointment({ notes: "n".repeat(501) })), /observação/i);
});
