/* =========================================================
   SETH — EDIT THIS BLOCK. Everything here is yours to change,
   nothing else in the file needs to be touched for day-to-day use.
   ========================================================= */
const CONFIG = {
  // Your real phone number, digits only, with country code.
  // This is where booking requests get texted.
  ownerPhone: "13215550134",

  // Your real email, used for the "Email instead" button.
  ownerEmail: "seth@example.com",

  // Days you're NOT available. Add/remove lines any time.
  // Format: "YYYY-MM-DD"
  blockedDates: [
    // "2026-08-15",
    // "2026-08-22",
  ],

  // How many days ahead people can book.
  daysAheadAllowed: 35,

  // Timezone used for the "Add to calendar" link in the text you get.
  calendarTimezone: "America/New_York",
};
/* ========================================================= */

(function () {
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarRange = document.getElementById("calendarRange");
  const prevWeekBtn = document.getElementById("prevWeek");
  const nextWeekBtn = document.getElementById("nextWeek");
  const timeOptions = document.getElementById("timeOptions");
  const selectionSummary = document.getElementById("selectionSummary");
  const sendRequestBtn = document.getElementById("sendRequestBtn");
  const emailInsteadBtn = document.getElementById("emailInsteadBtn");
  const bookingForm = document.getElementById("bookingForm");

  const footerPhone = document.getElementById("footerPhone");
  const footerEmail = document.getElementById("footerEmail");
  if (footerPhone) {
    footerPhone.href = `tel:+${CONFIG.ownerPhone}`;
    footerPhone.textContent = formatPhoneDisplay(CONFIG.ownerPhone);
  }
  if (footerEmail) {
    footerEmail.href = `mailto:${CONFIG.ownerEmail}`;
    footerEmail.textContent = CONFIG.ownerEmail;
  }

  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTH = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  let weekOffset = 0; // 0 = today's week window
  let selectedDate = null; // "YYYY-MM-DD"
  let selectedDateLabel = "";
  let selectedTime = null;

  function toISODate(d) {
    return d.toISOString().slice(0, 10);
  }

  function buildDayList() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() + weekOffset * 7);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }

  function renderCalendar() {
    const days = buildDayList();
    calendarGrid.innerHTML = "";

    days.forEach((d) => {
      const iso = toISODate(d);
      const blocked = CONFIG.blockedDates.includes(iso);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day" + (blocked ? " cal-day-blocked" : "");
      if (iso === selectedDate) btn.classList.add("cal-day-selected");
      btn.disabled = blocked;
      btn.setAttribute("aria-pressed", iso === selectedDate ? "true" : "false");
      btn.innerHTML = `<span class="dow">${DOW[d.getDay()]}</span><span class="dom">${d.getDate()}</span>`;

      btn.addEventListener("click", () => {
        selectedDate = iso;
        selectedDateLabel = `${DOW[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`;
        renderCalendar();
        updateSummary();
      });

      calendarGrid.appendChild(btn);
    });

    const first = days[0];
    const last = days[6];
    calendarRange.textContent =
      first.getMonth() === last.getMonth()
        ? `${MONTH[first.getMonth()]} ${first.getDate()}–${last.getDate()}`
        : `${MONTH[first.getMonth()]} ${first.getDate()} – ${MONTH[last.getMonth()]} ${last.getDate()}`;

    prevWeekBtn.disabled = weekOffset <= 0;
    nextWeekBtn.disabled = weekOffset * 7 + 7 >= CONFIG.daysAheadAllowed;
  }

  prevWeekBtn.addEventListener("click", () => {
    if (weekOffset > 0) {
      weekOffset--;
      renderCalendar();
    }
  });
  nextWeekBtn.addEventListener("click", () => {
    if (weekOffset * 7 + 7 < CONFIG.daysAheadAllowed) {
      weekOffset++;
      renderCalendar();
    }
  });

  timeOptions.querySelectorAll(".time-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      timeOptions.querySelectorAll(".time-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedTime = btn.dataset.time;
      updateSummary();
    });
  });

  function updateSummary() {
    if (selectedDate && selectedTime) {
      selectionSummary.textContent = `${selectedDateLabel} — ${selectedTime}`;
      sendRequestBtn.disabled = false;
      emailInsteadBtn.disabled = false;
    } else if (selectedDate) {
      selectionSummary.textContent = `${selectedDateLabel} — pick a rough time above.`;
      sendRequestBtn.disabled = true;
      emailInsteadBtn.disabled = true;
    } else {
      selectionSummary.textContent = "Pick a day and a time above to continue.";
      sendRequestBtn.disabled = true;
      emailInsteadBtn.disabled = true;
    }
  }

  function formatPhoneDisplay(digits) {
    // digits like "13215550134" -> "(321) 555-0134"
    const d = digits.replace(/\D/g, "");
    const local = d.length === 11 ? d.slice(1) : d;
    if (local.length !== 10) return digits;
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }

  function timeWindowToHours(timeLabel) {
    if (!timeLabel) return [9, 0, 11, 0];
    if (timeLabel.startsWith("Morning")) return [8, 0, 11, 0];
    if (timeLabel.startsWith("Afternoon")) return [12, 0, 15, 0];
    return [16, 0, 18, 0];
  }

  function googleCalendarLink(name, services, dateISO, timeLabel, address) {
    const [sh, sm, eh, em] = timeWindowToHours(timeLabel);
    const d = dateISO.replace(/-/g, "");
    const pad = (n) => String(n).padStart(2, "0");
    const startStr = `${d}T${pad(sh)}${pad(sm)}00`;
    const endStr = `${d}T${pad(eh)}${pad(em)}00`;
    const title = encodeURIComponent(`${services || "Yard work"} — ${name}`);
    const details = encodeURIComponent(`Job for ${name}. ${services || ""}`.trim());
    const location = encodeURIComponent(address || "Sullivan Ranch");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}&ctz=${encodeURIComponent(CONFIG.calendarTimezone)}`;
  }

  function buildMessage() {
    const form = new FormData(bookingForm);
    const name = (form.get("name") || "").toString().trim();
    const phone = (form.get("phone") || "").toString().trim();
    const address = (form.get("address") || "").toString().trim();
    const notes = (form.get("notes") || "").toString().trim();
    const services = form.getAll("service").join(", ") || "Not specified";

    const calLink = googleCalendarLink(name, services, selectedDate, selectedTime, address);

    const lines = [
      `New job request — Seth's Yard Work`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Address: ${address}`,
      `Day: ${selectedDateLabel}`,
      `Time: ${selectedTime}`,
      `Service: ${services}`,
      notes ? `Notes: ${notes}` : null,
      `Add to calendar: ${calLink}`,
    ].filter(Boolean);

    return lines.join("\n");
  }

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!bookingForm.reportValidity()) return;
    if (!selectedDate || !selectedTime) return;

    const message = buildMessage();
    const smsUrl = `sms:${CONFIG.ownerPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  });

  emailInsteadBtn.addEventListener("click", () => {
    if (!bookingForm.reportValidity()) return;
    if (!selectedDate || !selectedTime) return;

    const message = buildMessage();
    const subject = encodeURIComponent("Yard work request — Sullivan Ranch");
    const mailUrl = `mailto:${CONFIG.ownerEmail}?subject=${subject}&body=${encodeURIComponent(message)}`;
    window.location.href = mailUrl;
  });

  renderCalendar();
  updateSummary();
})();
