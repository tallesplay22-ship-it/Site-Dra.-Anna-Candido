const database = require("../config/database");

function createAppointmentSlot({ date, time }) {
  try {
    database.prepare(`
      INSERT INTO appointments (date, time)
      VALUES (?, ?)
    `).run(date, time);
    return true;
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
        (error.code === "ERR_SQLITE_ERROR" && error.errcode === 2067)) {
      return false;
    }
    throw error;
  }
}

module.exports = { createAppointmentSlot };
