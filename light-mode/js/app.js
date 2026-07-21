(function () {
  "use strict";

  /* ---------- storage (falls back to in-memory if localStorage is unavailable) ---------- */

  var memoryStore = {};
  var storageBroken = false;

  function storageGet(key, fallback) {
    if (storageBroken) {
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : fallback;
    }
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      storageBroken = true;
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : fallback;
    }
  }

  function storageSet(key, value) {
    memoryStore[key] = value;
    if (storageBroken) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      storageBroken = true;
    }
  }

  function storageRemove(key) {
    delete memoryStore[key];
    if (storageBroken) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      storageBroken = true;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- DOM refs ---------- */

  var sessionToggle = document.getElementById("session-toggle");
  var sessionTimer = document.getElementById("session-timer");
  var elapsedEl = document.getElementById("elapsed");
  var nudgeBanner = document.getElementById("nudge-banner");
  var nudgeText = document.getElementById("nudge-text");
  var nudgeDismiss = document.getElementById("nudge-dismiss");
  var toolOverlay = document.getElementById("tool-overlay");
  var toolContent = document.getElementById("tool-content");
  var toolClose = document.getElementById("tool-close");

  /* ---------- Light Mode session ---------- */

  var NUDGE_INTERVAL_MS = 20 * 60 * 1000;
  var NUDGE_MESSAGES = [
    "You've been focused for {n} minutes.",
    "{n} minutes in Light Mode. Nice and steady.",
    "Still here — {n} minutes of focus so far."
  ];

  var sessionIntervalId = null;

  function formatElapsed(ms) {
    var totalSeconds = Math.max(0, Math.floor(ms / 1000));
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }
    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
  }

  function showNudge(minutes) {
    var template = NUDGE_MESSAGES[minutes % NUDGE_MESSAGES.length];
    nudgeText.textContent = template.replace("{n}", String(minutes));
    nudgeBanner.hidden = false;
  }

  function hideNudge() {
    nudgeBanner.hidden = true;
  }

  function tickSession() {
    var start = storageGet("lm_session_start", null);
    if (!start) return;
    var elapsed = Date.now() - start;
    elapsedEl.textContent = formatElapsed(elapsed);

    var step = Math.floor(elapsed / NUDGE_INTERVAL_MS);
    var lastStep = storageGet("lm_last_nudge_step", 0);
    if (step > lastStep) {
      storageSet("lm_last_nudge_step", step);
      showNudge(step * 20);
    }
  }

  function startSessionTimer() {
    if (sessionIntervalId) return;
    tickSession();
    sessionIntervalId = window.setInterval(tickSession, 1000);
  }

  function stopSessionTimer() {
    if (sessionIntervalId) {
      window.clearInterval(sessionIntervalId);
      sessionIntervalId = null;
    }
  }

  function setSessionUI(active) {
    if (active) {
      sessionToggle.textContent = "Exit Light Mode";
      sessionToggle.classList.add("active");
      sessionTimer.hidden = false;
    } else {
      sessionToggle.textContent = "Enter Light Mode";
      sessionToggle.classList.remove("active");
      sessionTimer.hidden = true;
      elapsedEl.textContent = "00:00:00";
    }
  }

  function enterLightMode() {
    storageSet("lm_session_start", Date.now());
    storageSet("lm_last_nudge_step", 0);
    setSessionUI(true);
    startSessionTimer();
  }

  function exitLightMode() {
    storageRemove("lm_session_start");
    storageRemove("lm_last_nudge_step");
    stopSessionTimer();
    hideNudge();
    setSessionUI(false);
  }

  sessionToggle.addEventListener("click", function () {
    var start = storageGet("lm_session_start", null);
    if (start) {
      exitLightMode();
    } else {
      enterLightMode();
    }
  });

  nudgeDismiss.addEventListener("click", hideNudge);

  (function resumeSession() {
    var start = storageGet("lm_session_start", null);
    if (start) {
      setSessionUI(true);
      startSessionTimer();
    } else {
      setSessionUI(false);
    }
  })();

  /* ---------- tool overlay ---------- */

  function openTool(name) {
    var renderer = TOOLS[name];
    if (!renderer) return;
    toolContent.innerHTML = "";
    renderer(toolContent);
    toolOverlay.hidden = false;
  }

  function closeTool() {
    toolOverlay.hidden = true;
    toolContent.innerHTML = "";
  }

  toolClose.addEventListener("click", closeTool);
  toolOverlay.addEventListener("click", function (evt) {
    if (evt.target === toolOverlay) closeTool();
  });

  document.querySelectorAll(".tool-tile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      var name = tile.getAttribute("data-tool");
      if (name === "podcasts") {
        window.open("https://podcasts.apple.com/", "_blank", "noopener");
        return;
      }
      if (name === "music") {
        window.open("https://music.apple.com/", "_blank", "noopener");
        return;
      }
      openTool(name);
    });
  });

  /* ---------- Alarm ---------- */

  var alarmCheckIntervalId = null;

  function playBeep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var oscillator = ctx.createOscillator();
      var gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.6);
      oscillator.onended = function () {
        ctx.close();
      };
    } catch (e) {
      /* audio unavailable; visual alert still fires */
    }
  }

  function currentHHMM() {
    var now = new Date();
    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }
    return pad(now.getHours()) + ":" + pad(now.getMinutes());
  }

  function checkAlarm() {
    var alarm = storageGet("lm_alarm", null);
    if (!alarm || !alarm.enabled) return;
    if (currentHHMM() === alarm.time) {
      alarm.enabled = false;
      storageSet("lm_alarm", alarm);
      playBeep();
      window.alert("Alarm: " + alarm.time);
      if (document.getElementById("alarm-status")) renderAlarmStatus();
    }
  }

  function ensureAlarmWatcher() {
    if (alarmCheckIntervalId) return;
    alarmCheckIntervalId = window.setInterval(checkAlarm, 1000);
  }
  ensureAlarmWatcher();

  function renderAlarmStatus() {
    var statusEl = document.getElementById("alarm-status");
    if (!statusEl) return;
    var alarm = storageGet("lm_alarm", null);
    if (alarm && alarm.enabled) {
      statusEl.textContent = "Alarm set for " + alarm.time + ".";
    } else if (alarm) {
      statusEl.textContent = "Last alarm was " + alarm.time + " (not active).";
    } else {
      statusEl.textContent = "No alarm set.";
    }
  }

  function renderAlarm(container) {
    var alarm = storageGet("lm_alarm", null);
    container.innerHTML =
      '<h2>Alarm</h2>' +
      '<p class="hint">Only fires while this page is open and your phone is unlocked. iOS suspends background tabs, so this is a reminder, not a replacement for the Clock app.</p>' +
      '<div class="field-row">' +
      '<input type="time" id="alarm-time" value="' + (alarm ? alarm.time : "") + '" />' +
      '<button class="btn" id="alarm-set">Set</button>' +
      "</div>" +
      '<button class="btn secondary" id="alarm-clear">Clear alarm</button>' +
      '<p id="alarm-status" class="hint"></p>';

    renderAlarmStatus();

    document.getElementById("alarm-set").addEventListener("click", function () {
      var timeInput = document.getElementById("alarm-time");
      if (!timeInput.value) return;
      storageSet("lm_alarm", { time: timeInput.value, enabled: true });
      renderAlarmStatus();
    });

    document.getElementById("alarm-clear").addEventListener("click", function () {
      storageRemove("lm_alarm");
      document.getElementById("alarm-time").value = "";
      renderAlarmStatus();
    });
  }

  /* ---------- Calculator ---------- */

  function renderCalculator(container) {
    container.innerHTML =
      '<h2>Calculator</h2>' +
      '<div class="calc-display" id="calc-display">0</div>' +
      '<div class="calc-grid">' +
      keyHtml("AC") + keyHtml("±") + keyHtml("%") + keyHtml("÷", true) +
      keyHtml("7") + keyHtml("8") + keyHtml("9") + keyHtml("×", true) +
      keyHtml("4") + keyHtml("5") + keyHtml("6") + keyHtml("−", true) +
      keyHtml("1") + keyHtml("2") + keyHtml("3") + keyHtml("+", true) +
      keyHtml("0") + keyHtml(".") + keyHtml("=", true) +
      "</div>";

    function keyHtml(label, isOp) {
      return '<button class="calc-key' + (isOp ? " op" : "") + '" data-key="' + label + '">' + label + "</button>";
    }

    var display = document.getElementById("calc-display");
    var current = "0";
    var previous = null;
    var operator = null;
    var waitingForOperand = false;

    function updateDisplay() {
      display.textContent = current;
    }

    function inputDigit(d) {
      if (waitingForOperand) {
        current = d;
        waitingForOperand = false;
      } else {
        current = current === "0" ? d : current + d;
      }
    }

    function inputDecimal() {
      if (waitingForOperand) {
        current = "0.";
        waitingForOperand = false;
        return;
      }
      if (current.indexOf(".") === -1) current += ".";
    }

    function clearAll() {
      current = "0";
      previous = null;
      operator = null;
      waitingForOperand = false;
    }

    function toggleSign() {
      if (current === "0") return;
      current = current.charAt(0) === "-" ? current.slice(1) : "-" + current;
    }

    function percent() {
      current = String(parseFloat(current) / 100);
    }

    function compute(a, b, op) {
      switch (op) {
        case "+":
          return a + b;
        case "−":
          return a - b;
        case "×":
          return a * b;
        case "÷":
          return b === 0 ? NaN : a / b;
        default:
          return b;
      }
    }

    function setOperator(nextOperator) {
      var inputValue = parseFloat(current);
      if (operator && waitingForOperand) {
        operator = nextOperator;
        return;
      }
      if (previous === null) {
        previous = inputValue;
      } else if (operator) {
        var result = compute(previous, inputValue, operator);
        previous = result;
        current = isNaN(result) ? "Error" : String(round(result));
      }
      waitingForOperand = true;
      operator = nextOperator;
    }

    function round(n) {
      return Math.round(n * 1e10) / 1e10;
    }

    function equals() {
      if (operator === null || previous === null) return;
      var inputValue = parseFloat(current);
      var result = compute(previous, inputValue, operator);
      current = isNaN(result) ? "Error" : String(round(result));
      previous = null;
      operator = null;
      waitingForOperand = true;
    }

    container.querySelectorAll(".calc-key").forEach(function (key) {
      key.addEventListener("click", function () {
        var label = key.getAttribute("data-key");
        if (/^[0-9]$/.test(label)) {
          inputDigit(label);
        } else if (label === ".") {
          inputDecimal();
        } else if (label === "AC") {
          clearAll();
        } else if (label === "±") {
          toggleSign();
        } else if (label === "%") {
          percent();
        } else if (label === "=") {
          equals();
        } else {
          setOperator(label);
        }
        updateDisplay();
      });
    });

    updateDisplay();
  }

  /* ---------- Notes ---------- */

  function renderNotes(container) {
    var editingId = null;

    container.innerHTML =
      '<h2>Notes</h2>' +
      '<div class="field-row">' +
      '<textarea id="note-input" rows="3" placeholder="Write a note"></textarea>' +
      "</div>" +
      '<div class="field-row">' +
      '<button class="btn" id="note-save">Save</button>' +
      '<button class="btn secondary" id="note-new">New</button>' +
      "</div>" +
      '<div class="list" id="notes-list"></div>';

    var input = document.getElementById("note-input");

    function renderList() {
      var notes = storageGet("lm_notes", []);
      var listEl = document.getElementById("notes-list");
      if (notes.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No notes yet.</p>';
        return;
      }
      listEl.innerHTML = notes
        .slice()
        .sort(function (a, b) {
          return b.updatedAt - a.updatedAt;
        })
        .map(function (note) {
          return (
            '<div class="list-item">' +
            '<span class="item-text" data-edit="' + note.id + '">' + escapeHtml(note.text) + "</span>" +
            '<button data-delete="' + note.id + '">Delete</button>' +
            "</div>"
          );
        })
        .join("");

      listEl.querySelectorAll("[data-edit]").forEach(function (el) {
        el.addEventListener("click", function () {
          var id = el.getAttribute("data-edit");
          var note = notes.find(function (n) {
            return n.id === id;
          });
          if (!note) return;
          editingId = id;
          input.value = note.text;
          input.focus();
        });
      });

      listEl.querySelectorAll("[data-delete]").forEach(function (el) {
        el.addEventListener("click", function () {
          var id = el.getAttribute("data-delete");
          var updated = storageGet("lm_notes", []).filter(function (n) {
            return n.id !== id;
          });
          storageSet("lm_notes", updated);
          if (editingId === id) {
            editingId = null;
            input.value = "";
          }
          renderList();
        });
      });
    }

    document.getElementById("note-save").addEventListener("click", function () {
      var text = input.value.trim();
      if (!text) return;
      var notes = storageGet("lm_notes", []);
      if (editingId) {
        notes = notes.map(function (n) {
          return n.id === editingId ? { id: n.id, text: text, updatedAt: Date.now() } : n;
        });
      } else {
        notes.push({ id: uid(), text: text, updatedAt: Date.now() });
      }
      storageSet("lm_notes", notes);
      editingId = null;
      input.value = "";
      renderList();
    });

    document.getElementById("note-new").addEventListener("click", function () {
      editingId = null;
      input.value = "";
      input.focus();
    });

    renderList();
  }

  /* ---------- Tasks ---------- */

  function renderTasks(container) {
    container.innerHTML =
      '<h2>Tasks</h2>' +
      '<div class="field-row">' +
      '<input type="text" id="task-input" placeholder="Add a task" />' +
      '<button class="btn" id="task-add">Add</button>' +
      "</div>" +
      '<div class="list" id="tasks-list"></div>';

    var input = document.getElementById("task-input");

    function renderList() {
      var tasks = storageGet("lm_tasks", []);
      var listEl = document.getElementById("tasks-list");
      if (tasks.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No tasks yet.</p>';
        return;
      }
      listEl.innerHTML = tasks
        .map(function (task) {
          return (
            '<div class="list-item' + (task.done ? " done" : "") + '">' +
            '<input type="checkbox" data-toggle="' + task.id + '" ' + (task.done ? "checked" : "") + " />" +
            '<span class="item-text">' + escapeHtml(task.text) + "</span>" +
            '<button data-delete="' + task.id + '">Delete</button>' +
            "</div>"
          );
        })
        .join("");

      listEl.querySelectorAll("[data-toggle]").forEach(function (el) {
        el.addEventListener("change", function () {
          var id = el.getAttribute("data-toggle");
          var tasks = storageGet("lm_tasks", []).map(function (t) {
            return t.id === id ? { id: t.id, text: t.text, done: !t.done } : t;
          });
          storageSet("lm_tasks", tasks);
          renderList();
        });
      });

      listEl.querySelectorAll("[data-delete]").forEach(function (el) {
        el.addEventListener("click", function () {
          var id = el.getAttribute("data-delete");
          var tasks = storageGet("lm_tasks", []).filter(function (t) {
            return t.id !== id;
          });
          storageSet("lm_tasks", tasks);
          renderList();
        });
      });
    }

    document.getElementById("task-add").addEventListener("click", function () {
      var text = input.value.trim();
      if (!text) return;
      var tasks = storageGet("lm_tasks", []);
      tasks.push({ id: uid(), text: text, done: false });
      storageSet("lm_tasks", tasks);
      input.value = "";
      renderList();
    });

    input.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter") document.getElementById("task-add").click();
    });

    renderList();
  }

  /* ---------- Weather ---------- */

  var WEATHER_CODES = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail"
  };

  function renderWeather(container) {
    container.innerHTML = '<h2>Weather</h2><div id="weather-body"><p class="empty-state">Getting your location&hellip;</p></div>';
    var body = document.getElementById("weather-body");

    function showError(message) {
      body.innerHTML = '<p class="hint">' + message + '</p><button class="btn secondary" id="weather-retry">Try again</button>';
      document.getElementById("weather-retry").addEventListener("click", load);
    }

    function load() {
      body.innerHTML = '<p class="empty-state">Getting your location&hellip;</p>';
      if (!("geolocation" in navigator)) {
        showError("Location isn't available in this browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        function () {
          showError("Location unavailable — enable it in Settings to see weather.");
        },
        { timeout: 10000 }
      );
    }

    function fetchWeather(lat, lon) {
      body.innerHTML = '<p class="empty-state">Loading weather&hellip;</p>';
      var url =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        lat +
        "&longitude=" +
        lon +
        "&current_weather=true";
      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("bad response");
          return res.json();
        })
        .then(function (data) {
          var cw = data && data.current_weather;
          if (!cw) throw new Error("no data");
          var desc = WEATHER_CODES[cw.weathercode] || "Weather code " + cw.weathercode;
          body.innerHTML =
            '<div class="weather-current">' +
            '<div class="weather-temp">' + Math.round(cw.temperature) + "°C</div>" +
            '<div class="weather-desc">' + escapeHtml(desc) + "</div>" +
            "</div>";
        })
        .catch(function () {
          showError("Couldn't load weather right now.");
        });
    }

    load();
  }

  /* ---------- Directions ---------- */

  function renderDirections(container) {
    container.innerHTML =
      '<h2>Directions</h2>' +
      '<div class="field-row">' +
      '<input type="text" id="directions-query" placeholder="Search a place or address" />' +
      "</div>" +
      '<button class="btn" id="directions-go">Open in Maps</button>';

    function go() {
      var query = document.getElementById("directions-query").value.trim();
      if (!query) return;
      window.open("https://maps.apple.com/?q=" + encodeURIComponent(query), "_blank", "noopener");
    }

    document.getElementById("directions-go").addEventListener("click", go);
    document.getElementById("directions-query").addEventListener("keydown", function (evt) {
      if (evt.key === "Enter") go();
    });
  }

  /* ---------- helpers ---------- */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var TOOLS = {
    alarm: renderAlarm,
    calculator: renderCalculator,
    notes: renderNotes,
    tasks: renderTasks,
    weather: renderWeather,
    directions: renderDirections
  };

  /* ---------- service worker ---------- */

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (err) {
        console.log("Service worker registration failed:", err);
      });
    });
  }
})();
