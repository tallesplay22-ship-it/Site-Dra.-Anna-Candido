const { createAppointmentSlot } = require("../models/appointmentModel");

const allowedServices = new Set([
  "Consulta veterinária",
  "Retorno",
  "Outro atendimento"
]);
const allowedTimes = new Set([
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00"
]);

function todayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsedDate = new Date(`${date}T12:00:00Z`);
  return !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date;
}

function isWeekday(date) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return day >= 1 && day <= 5;
}

function isFutureTimeToday(date, time) {
  if (date !== todayInSaoPaulo()) return true;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return time > `${values.hour}:${values.minute}`;
}

function validateAppointment(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Envie os dados da consulta em um formulário válido.";
  }

  const requiredFields = ["name", "phone", "petName", "service", "date", "time", "consent"];
  for (const field of requiredFields) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      return "Preencha todos os campos obrigatórios do agendamento.";
    }
  }

  const name = body.name.trim();
  const petName = body.petName.trim();
  const phone = body.phone.trim();
  const phoneDigits = phone.replace(/\D/g, "");
  const hasControlCharacters = [name, petName, phone].some((value) => /[\u0000-\u001f\u007f]/.test(value));

  if (body.consent !== "on") {
    return "É necessário concordar com o uso dos dados para solicitar uma consulta.";
  }
  if (name.length > 100 || petName.length > 80 || hasControlCharacters) {
    return "Revise os nomes informados e tente novamente.";
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 13 || phone.length > 30) {
    return "Informe um telefone com DDD.";
  }
  if (!allowedServices.has(body.service.trim())) {
    return "Selecione um tipo de consulta válido.";
  }
  if (!isValidDate(body.date) || body.date < todayInSaoPaulo()) {
    return "Escolha uma data válida, a partir de hoje.";
  }
  if (!isWeekday(body.date)) {
    return "Os atendimentos para agendamento online são de segunda a sexta-feira.";
  }
  if (!allowedTimes.has(body.time)) {
    return "Escolha um horário disponível entre 9h e 17h.";
  }
  if (!isFutureTimeToday(body.date, body.time)) {
    return "Escolha um horário futuro, por favor.";
  }
  if (body.notes !== undefined &&
      (typeof body.notes !== "string" || body.notes.trim().length > 500)) {
    return "A observação deve ter no máximo 500 caracteres.";
  }

  return null;
}

function createAppointment(request, response, next) {
  const validationError = validateAppointment(request.body);
  if (validationError) {
    return response.status(400).json({ error: validationError });
  }

  try {
    const created = createAppointmentSlot({
      date: request.body.date,
      time: request.body.time
    });
    if (!created) {
      return response.status(409).json({
        error: "Esse horário acabou de ser reservado. Escolha outro, por favor."
      });
    }
  } catch (error) {
    return next(error);
  }

  return response.status(201).json({
    message: "Solicitação registrada. Envie os dados pelo WhatsApp para a Dra. Anna Flávia confirmar o horário."
  });
}

module.exports = { createAppointment, validateAppointment };
