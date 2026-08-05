/* =========================================================
   SETH — EDIT THIS BLOCK. Everything here is yours to change,
   nothing else in the file needs to be touched for day-to-day use.
   ========================================================= */
const CONFIG = {
  // Your real phone number, digits only, with country code.
  // This is where booking requests get texted.
  ownerPhone: "13526028338",

  // Your real email, used for the "Email instead" button.
  ownerEmail: "seth.soileau123456@gmail.com",

  // Days you're NOT available. Add/remove lines any time.
  // Format: "YYYY-MM-DD"
  blockedDates: [
    // "2026-08-15",
    // "2026-08-22",
  ],

  // How many days ahead people can book.
  daysAheadAllowed: 35,

  // Time slots offered on school days (Mon–Fri) vs weekends.
  // Edit the label or the hours [hour, minute] any time.
  weekdaySlots: [
    { label: "After school (4–6:30pm)", start: [16, 0], end: [18, 30] },
  ],
  weekendSlots: [
    { label: "Morning (9–11am)", start: [9, 0], end: [11, 0] },
    { label: "Afternoon (12–3pm)", start: [12, 0], end: [15, 0] },
    { label: "Evening (4–6pm)", start: [16, 0], end: [18, 0] },
  ],

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
  const timeLegend = document.getElementById("timeLegend");
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
  let selectedSlot = null; // { label, start:[h,m], end:[h,m] }

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
        selectedSlot = null;
        renderCalendar();
        renderTimeOptions(d);
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

  function renderTimeOptions(dateObj) {
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const slots = isWeekend ? CONFIG.weekendSlots : CONFIG.weekdaySlots;
    timeLegend.textContent = isWeekend ? "Time of day" : "After-school time";

    timeOptions.innerHTML = "";
    slots.forEach((slot) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "time-btn";
      btn.textContent = slot.label;
      btn.addEventListener("click", () => {
        timeOptions.querySelectorAll(".time-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedSlot = slot;
        updateSummary();
      });
      timeOptions.appendChild(btn);
    });

    // Only one option on school days — select it automatically.
    if (slots.length === 1) {
      slots[0]._auto = true;
      timeOptions.querySelector(".time-btn").click();
    }
  }

  function updateSummary() {
    if (selectedDate && selectedSlot) {
      selectionSummary.textContent = `${selectedDateLabel} — ${selectedSlot.label}`;
      sendRequestBtn.disabled = false;
      emailInsteadBtn.disabled = false;
    } else if (selectedDate) {
      selectionSummary.textContent = `${selectedDateLabel} — pick a time above.`;
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

  function googleCalendarLink(name, services, dateISO, slot, address) {
    const [sh, sm] = slot.start;
    const [eh, em] = slot.end;
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
    const priceOffer = (form.get("priceOffer") || "").toString().trim();
    const notes = (form.get("notes") || "").toString().trim();
    const services = form.getAll("service").join(", ") || "Not specified";

    const calLink = googleCalendarLink(name, services, selectedDate, selectedSlot, address);

    const lines = [
      `New job request — Seth's Yard Work`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Address: ${address}`,
      `Day: ${selectedDateLabel}`,
      `Time: ${selectedSlot.label}`,
      `Service: ${services}`,
      `Offering: ${priceOffer}`,
      notes ? `Notes: ${notes}` : null,
      `Add to calendar: ${calLink}`,
    ].filter(Boolean);

    return lines.join("\n");
  }

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!bookingForm.reportValidity()) return;
    if (!selectedDate || !selectedSlot) return;

    const message = buildMessage();
    const smsUrl = `sms:${CONFIG.ownerPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  });

  emailInsteadBtn.addEventListener("click", () => {
    if (!bookingForm.reportValidity()) return;
    if (!selectedDate || !selectedSlot) return;

    const message = buildMessage();
    const subject = encodeURIComponent("Yard work request — Sullivan Ranch");
    const mailUrl = `mailto:${CONFIG.ownerEmail}?subject=${subject}&body=${encodeURIComponent(message)}`;
    window.location.href = mailUrl;
  });

  renderCalendar();
  updateSummary();
})();
