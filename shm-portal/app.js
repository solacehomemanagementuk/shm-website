const entityConfig = {
  landlordLeads: {
    label: "Landlord Leads",
    singular: "landlord lead",
    icon: "♧",
    fields: [
      { key: "name", label: "Contact name", required: true },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone" },
      { key: "source", label: "Enquiry source", type: "select", options: ["Website", "Referral", "Telephone", "Other"] },
      { key: "status", label: "Status", type: "select", options: ["New", "Contacted", "Qualified", "Converted", "Lost"] },
      { key: "notes", label: "Notes", type: "textarea", full: true }
    ],
    columns: [
      ["name", "Contact"], ["email", "Email"], ["source", "Source"], ["status", "Status"]
    ],
    defaults: { name: "", email: "", phone: "", source: "Website", status: "New", notes: "" }
  },
  landlords: {
    label: "Landlords",
    singular: "landlord",
    icon: "♙",
    fields: [
      { key: "name", label: "Landlord name", required: true },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone" },
      { key: "properties", label: "Managed properties", type: "number", min: 0 },
      { key: "status", label: "Status", type: "select", options: ["Active", "Onboarding", "Inactive"] },
      { key: "notes", label: "Notes", type: "textarea", full: true }
    ],
    columns: [["name", "Landlord"], ["email", "Email"], ["properties", "Properties"], ["status", "Status"]],
    defaults: { name: "", email: "", phone: "", properties: "0", status: "Onboarding", notes: "" }
  },
  tenantLeads: {
    label: "Tenant Leads",
    singular: "tenant lead",
    icon: "♧",
    fields: [
      { key: "name", label: "Contact name", required: true },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone" },
      { key: "property", label: "Property of interest" },
      { key: "status", label: "Status", type: "select", options: ["New", "Contacted", "Viewing booked", "Converted", "Lost"] },
      { key: "notes", label: "Notes", type: "textarea", full: true }
    ],
    columns: [["name", "Contact"], ["email", "Email"], ["property", "Property interest"], ["status", "Status"]],
    defaults: { name: "", email: "", phone: "", property: "", status: "New", notes: "" }
  },
  tenants: {
    label: "Tenants",
    singular: "tenant",
    icon: "♙",
    fields: [
      { key: "name", label: "Tenant name", required: true },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone" },
      { key: "property", label: "Property" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Application", "Former"] },
      { key: "notes", label: "Notes", type: "textarea", full: true }
    ],
    columns: [["name", "Tenant"], ["email", "Email"], ["property", "Property"], ["status", "Status"]],
    defaults: { name: "", email: "", phone: "", property: "", status: "Application", notes: "" }
  },
  properties: {
    label: "Properties",
    singular: "property",
    icon: "⌂",
    fields: [
      { key: "address", label: "Property address", required: true },
      { key: "type", label: "Property type", type: "select", options: ["Flat", "House", "Studio", "Other"] },
      { key: "bedrooms", label: "Bedrooms", type: "number", min: 0 },
      { key: "rent", label: "Monthly rent (£)", type: "number", min: 0 },
      { key: "landlord", label: "Landlord" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Available", "Let", "Maintenance"] },
      { key: "notes", label: "Notes", type: "textarea", full: true }
    ],
    columns: [["address", "Property"], ["type", "Type"], ["bedrooms", "Beds"], ["rent", "Monthly rent"], ["landlord", "Landlord"], ["status", "Status"]],
    defaults: { address: "", type: "Flat", bedrooms: "0", rent: "0", landlord: "", status: "Draft", notes: "" }
  },
  viewings: {
    label: "Viewings",
    singular: "viewing",
    icon: "◷",
    fields: [
      { key: "property", label: "Property", required: true },
      { key: "contact", label: "Prospective tenant" },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "time", label: "Time", type: "time" },
      { key: "status", label: "Status", type: "select", options: ["Scheduled", "Completed", "Cancelled"] },
      { key: "notes", label: "Notes", type: "textarea", full: true }
    ],
    columns: [["property", "Property"], ["contact", "Prospective tenant"], ["date", "Date"], ["time", "Time"], ["status", "Status"]],
    defaults: { property: "", contact: "", date: "", time: "", status: "Scheduled", notes: "" }
  },
  tasks: {
    label: "Tasks & Reminders",
    singular: "task",
    icon: "✓",
    fields: [
      { key: "title", label: "Task", required: true },
      { key: "assignedTo", label: "Assigned to" },
      { key: "due", label: "Due date", type: "date" },
      { key: "priority", label: "Priority", type: "select", options: ["Low", "Normal", "High"] },
      { key: "status", label: "Status", type: "select", options: ["Open", "In progress", "Completed"] },
      { key: "notes", label: "Notes", type: "textarea", full: true }
    ],
    columns: [["title", "Task"], ["assignedTo", "Assigned to"], ["due", "Due"], ["priority", "Priority"], ["status", "Status"]],
    defaults: { title: "", assignedTo: "", due: "", priority: "Normal", status: "Open", notes: "" }
  }
};

const makeId = () => globalThis.crypto?.randomUUID?.()
  || `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const makeDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};
const makeSampleData = () => ({
  landlordLeads: [
    { id: makeId(), name: "Morgan Example", email: "morgan@example.invalid", phone: "000-000-0101", source: "Website", status: "New", notes: "Fictional demo record." },
    { id: makeId(), name: "Taylor Sample", email: "taylor@example.invalid", phone: "000-000-0102", source: "Referral", status: "Contacted", notes: "Fictional demo record." }
  ],
  landlords: [
    { id: makeId(), name: "Jordan Demo", email: "jordan@example.invalid", phone: "000-000-0201", properties: 2, status: "Active", notes: "Fictional demo record." }
  ],
  tenantLeads: [
    { id: makeId(), name: "Casey Example", email: "casey@example.invalid", phone: "000-000-0301", property: "12 Example Road", status: "Viewing booked", notes: "Fictional demo record." },
    { id: makeId(), name: "Riley Sample", email: "riley@example.invalid", phone: "000-000-0302", property: "8 Sample Lane", status: "New", notes: "Fictional demo record." }
  ],
  tenants: [
    { id: makeId(), name: "Avery Demo", email: "avery@example.invalid", phone: "000-000-0401", property: "12 Example Road", status: "Active", notes: "Fictional demo record." }
  ],
  properties: [
    { id: makeId(), address: "12 Example Road, Sampletown", type: "Flat", bedrooms: 2, rent: 1200, landlord: "Jordan Demo", status: "Let", notes: "Fictional demo property." },
    { id: makeId(), address: "8 Sample Lane, Sampletown", type: "House", bedrooms: 3, rent: 1650, landlord: "Jordan Demo", status: "Draft", notes: "Fictional demo property." }
  ],
  viewings: [
    { id: makeId(), property: "8 Sample Lane, Sampletown", contact: "Riley Sample", date: makeDate(2), time: "14:00", status: "Scheduled", notes: "Fictional demo appointment." }
  ],
  tasks: [
    { id: makeId(), title: "Review sample viewing notes", assignedTo: "Demo Workspace", due: makeDate(1), priority: "Normal", status: "Open", notes: "Fictional demo task." },
    { id: makeId(), title: "Prepare example property summary", assignedTo: "Demo Workspace", due: makeDate(3), priority: "Low", status: "In progress", notes: "Fictional demo task." }
  ]
});

const root = document.querySelector("#viewRoot");
const modalRoot = document.querySelector("#modalRoot");
const toast = document.querySelector("#toast");
const crumb = document.querySelector("#pageCrumb");
const sidebar = document.querySelector("#sidebar");
const sideNav = document.querySelector("#sideNav");
const dataViews = Object.keys(entityConfig);
let activeView = "dashboard";
let searchTerm = "";
let statusFilter = "";
let toastTimer;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);

const validateData = (value) => value && typeof value === "object"
  && dataViews.every((key) => Array.isArray(value[key])
    && value[key].every((record) => record && typeof record === "object" && typeof record.id === "string"));

let data = makeSampleData();

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
}

try {
  localStorage.removeItem("shmPortal.demo.v1");
} catch (error) {
  showToast(`Could not clear previous demo data from browser storage. Clear site storage before using this prototype. ${error.message}`);
}

const formatLabel = (value) => String(value || "").replace(/([a-z])([A-Z])/g, "$1 $2");
const statusClass = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
const getStats = () => ({
  landlords: data.landlords.length,
  tenants: data.tenants.length,
  properties: data.properties.length,
  viewings: data.viewings.filter((item) => item.status === "Scheduled").length
});

const renderPageHead = (title, description, buttonLabel, action, view = "") => `
  <div class="page-head">
    <div><p class="eyebrow">DEMO WORKSPACE</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>
    ${buttonLabel ? `<button class="btn" type="button" data-action="${escapeHtml(action)}" data-view="${escapeHtml(view)}">＋ ${escapeHtml(buttonLabel)}</button>` : ""}
  </div>`;

const renderDashboard = () => {
  const stats = getStats();
  const dueTasks = data.tasks.filter((item) => item.status !== "Completed").slice(0, 4);
  const recentLeads = [...data.landlordLeads, ...data.tenantLeads].slice(0, 4);
  return `
    ${renderPageHead("Dashboard", "A quick view of fictional sample activity in this demo workspace.", "", "")}
    <div class="stats-grid">
      ${[
        ["Landlords", stats.landlords, "♙"],
        ["Tenants", stats.tenants, "♙"],
        ["Properties", stats.properties, "⌂"],
        ["Upcoming viewings", stats.viewings, "◷"]
      ].map(([label, value, icon]) => `<article class="stat-card"><div class="stat-top">${label}<span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot">Sample records only</div></article>`).join("")}
    </div>
    <div class="dashboard-grid">
      <section class="panel"><div class="panel-head"><div><h2>Recent lead examples</h2><p>Fictional enquiries for demonstration</p></div><button class="btn secondary" type="button" data-action="view-leads">View leads</button></div><div class="panel-body">
        ${recentLeads.length ? recentLeads.map((item) => `<div class="activity-row"><span class="activity-icon">♧</span><div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.status)} · ${escapeHtml(item.email)}</small></div></div>`).join("") : '<div class="empty-state"><b>No demo leads</b><p>Add a sample lead to see it here.</p></div>'}
      </div></section>
      <section class="panel"><div class="panel-head"><div><h2>Tasks & reminders</h2><p>Open example tasks</p></div><button class="btn secondary" type="button" data-action="navigate" data-view="tasks">View tasks</button></div><div class="panel-body">
        ${dueTasks.length ? dueTasks.map((item) => `<div class="activity-row"><span class="activity-icon">✓</span><div><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.due || "No due date")} · ${escapeHtml(item.priority)}</small></div></div>`).join("") : '<div class="empty-state"><b>All clear</b><p>There are no open demo tasks.</p></div>'}
      </div></section>
    </div>
    <section class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>Quick actions</h2><p>Manage fictional records in this tab</p></div></div><div class="panel-body quick-actions">
      <button class="quick-action" data-action="add" data-view="landlordLeads"><b>＋ Add landlord lead</b><small>Record an example property enquiry</small></button>
      <button class="quick-action" data-action="add" data-view="tenantLeads"><b>＋ Add tenant lead</b><small>Record a fictional tenant enquiry</small></button>
      <button class="quick-action" data-action="add" data-view="properties"><b>＋ Add property</b><small>Add a sample property record</small></button>
      <button class="quick-action" data-action="add" data-view="tasks"><b>＋ Add task</b><small>Create a demo reminder</small></button>
    </div></section>`;
};

const renderCell = (record, key) => {
  const value = record[key] ?? "—";
  if (key === "status" || key === "priority") {
    return `<span class="badge ${statusClass(value)}">${escapeHtml(value)}</span>`;
  }
  if (key === "name" || key === "address" || key === "title") {
    return `<div class="primary-cell">${escapeHtml(value)}</div>`;
  }
  if (key === "rent" && Number(value)) return `£${Number(value).toLocaleString("en-GB")}`;
  return escapeHtml(value);
};

const getStatuses = (records) => [...new Set(records.map((record) => record.status).filter(Boolean))].sort();
const filteredRecords = (view) => {
  const term = searchTerm.toLowerCase();
  return data[view].filter((record) => {
    const matchesSearch = !term || Object.values(record).some((value) => String(value).toLowerCase().includes(term));
    return matchesSearch && (!statusFilter || record.status === statusFilter);
  });
};

const renderTable = (view) => {
  const config = entityConfig[view];
  const records = filteredRecords(view);
  const columns = config.columns.map(([key, label]) => `<th scope="col">${escapeHtml(label)}</th>`).join("");
  return records.length ? `<div class="table-wrap"><table class="data-table"><thead><tr>${columns}<th scope="col">Actions</th></tr></thead><tbody>
    ${records.map((record) => `<tr>${config.columns.map(([key]) => `<td>${renderCell(record, key)}</td>`).join("")}<td><div class="row-actions">
      <button class="icon-btn" type="button" data-action="edit" data-view="${view}" data-id="${escapeHtml(record.id)}" aria-label="Edit ${escapeHtml(config.singular)}">Edit</button>
      ${view.endsWith("Leads") && !["Converted", "Lost"].includes(record.status) ? `<button class="icon-btn" type="button" data-action="convert" data-view="${view}" data-id="${escapeHtml(record.id)}">Convert</button>` : ""}
      <button class="icon-btn" type="button" data-action="delete" data-view="${view}" data-id="${escapeHtml(record.id)}" aria-label="Delete ${escapeHtml(config.singular)}">Delete</button>
    </div></td></tr>`).join("")}
  </tbody></table></div>` : `<div class="empty-state"><span class="empty-icon">${config.icon}</span><b>No ${escapeHtml(config.label.toLowerCase())} found</b><p>Try changing the search or add a fictional demo record.</p></div>`;
};

const renderEntity = (view) => {
  const config = entityConfig[view];
  const statuses = getStatuses(data[view]);
  return `${renderPageHead(config.label, `Manage fictional ${config.label.toLowerCase()} sample records.`, `Add ${config.singular}`, "add", view)}
    <div class="toolbar">
      <label class="search-box"><span class="visually-hidden">Search ${escapeHtml(config.label)}</span><input id="recordSearch" type="search" placeholder="Search ${escapeHtml(config.label.toLowerCase())}…" value="${escapeHtml(searchTerm)}"></label>
      <label class="visually-hidden" for="statusFilter">Filter by status</label>
      <select class="filter-select" id="statusFilter"><option value="">All statuses</option>${statuses.map((status) => `<option value="${escapeHtml(status)}" ${statusFilter === status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select>
      <span class="record-count">${filteredRecords(view).length} of ${data[view].length} examples</span>
    </div>
    <section class="panel"><div class="panel-head"><div><h2>${escapeHtml(config.label)}</h2><p>All entries are fictional demo data.</p></div></div>${renderTable(view)}</section>`;
};

const renderReports = () => {
  const stats = getStats();
  const openTasks = data.tasks.filter((task) => task.status !== "Completed").length;
  const scheduledViewings = data.viewings.filter((item) => item.status === "Scheduled").length;
  return `${renderPageHead("Reports", "Live summaries calculated from temporary demo records in this tab.", "", "")}
    <div class="report-grid">
      ${[
        ["Landlord leads", data.landlordLeads.length, "Across all demo lead statuses"],
        ["Tenant leads", data.tenantLeads.length, "Across all demo lead statuses"],
        ["Properties by status", data.properties.length, `${data.properties.filter((item) => item.status === "Let").length} marked let · ${data.properties.filter((item) => item.status === "Available").length} marked available`],
        ["Scheduled viewings", scheduledViewings, "Example appointments only"],
        ["Open tasks", openTasks, "Tasks not marked completed"],
        ["Active accounts", stats.landlords + stats.tenants, "Landlord and tenant demo records"]
      ].map(([label, value, detail]) => `<article class="report-card"><h3>${escapeHtml(label)}</h3><div class="report-number">${value}</div><p>${escapeHtml(detail)}</p></article>`).join("")}
    </div>
    <section class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>Export demo report</h2><p>Download fictional sample records as a CSV file.</p></div><button class="btn" type="button" data-action="export-csv">Download CSV</button></div></section>`;
};

const renderSettings = () => `${renderPageHead("Settings & Data", "Manage this tab's temporary fictional demo workspace.", "", "")}
  <div class="settings-grid">
    <section class="setting-card"><h2>Demo data</h2><p>Records in this prototype are fictional and held temporarily in this tab's memory. They are not written to browser storage, shared with anyone, or synced to an SHM database; reloading the page restores the sample records.</p><p><b>${dataViews.reduce((sum, view) => sum + data[view].length, 0)}</b> demo records across ${dataViews.length} sections.</p><button class="btn secondary" type="button" data-action="export-json">Export demo data</button></section>
    <section class="setting-card"><h2>Import a demo backup</h2><p>Import a JSON export into this tab's temporary demo workspace. This does not import customer or account records into any SHM service.</p><label for="importFile">Choose a JSON backup</label><input id="importFile" type="file" accept="application/json,.json"><button class="btn secondary" type="button" data-action="import-json">Import selected file</button></section>
    <section class="setting-card"><h2>Reset the workspace</h2><p>Replace this tab's current demo records with the original fictional sample set. This cannot be undone until the page is reloaded.</p><button class="btn danger" type="button" data-action="reset">Reset demo data</button></section>
    <section class="setting-card"><h2>Production status</h2><p>This standalone prototype is not connected to the existing SHM login service. It has no authenticated session, role permissions, shared database, OTP service, or secure document storage.</p><p>Do not enter passwords, real names, contact details, tenancy information, or documents.</p></section>
  </div>`;

const render = () => {
  if (!root) return;
  const current = entityConfig[activeView];
  crumb.textContent = current?.label || ({ dashboard: "Dashboard", reports: "Reports", settings: "Settings & Data" }[activeView] || "Dashboard");
  sideNav.querySelectorAll(".nav-item").forEach((button) => {
    const selected = button.dataset.view === activeView;
    button.classList.toggle("active", selected);
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  root.innerHTML = activeView === "dashboard" ? renderDashboard()
    : entityConfig[activeView] ? renderEntity(activeView)
      : activeView === "reports" ? renderReports() : renderSettings();
};

const openModal = (view, record = null) => {
  const config = entityConfig[view];
  if (!config) return;
  const fields = config.fields.map((field) => {
    const value = record?.[field.key] ?? config.defaults[field.key] ?? "";
    const inputId = `field-${field.key}`;
    let control;
    if (field.type === "select") {
      control = `<select id="${inputId}" name="${field.key}" ${field.required ? "required" : ""}>${field.options.map((option) => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
    } else if (field.type === "textarea") {
      control = `<textarea id="${inputId}" name="${field.key}" rows="3">${escapeHtml(value)}</textarea>`;
    } else {
      control = `<input id="${inputId}" name="${field.key}" type="${field.type || "text"}" value="${escapeHtml(value)}" ${field.min !== undefined ? `min="${field.min}"` : ""} ${field.required ? "required" : ""} ${field.type === "number" ? 'step="1"' : ""}>`;
    }
    return `<div class="field ${field.full ? "full" : ""}"><label for="${inputId}">${escapeHtml(field.label)}${field.required ? " *" : ""}</label>${control}</div>`;
  }).join("");
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-head"><h2 id="modalTitle">${record ? "Edit" : "Add"} ${escapeHtml(config.singular)}</h2><button class="modal-close" type="button" data-action="close-modal" aria-label="Close dialog">×</button></div>
    <form class="modal-form" id="recordForm" data-view="${view}" data-id="${escapeHtml(record?.id || "")}">${fields}
      <div class="modal-actions"><button class="btn secondary" type="button" data-action="close-modal">Cancel</button><button class="btn" type="submit">Save demo record</button></div>
      <p class="form-error full" id="formError" role="alert"></p>
    </form>
  </section></div>`;
  modalRoot.querySelector(".modal").addEventListener("click", (event) => event.stopPropagation());
  modalRoot.querySelector("form input, form select, form textarea")?.focus();
};

const closeModal = () => { modalRoot.replaceChildren(); };

const updateRecord = (form) => {
  const view = form.dataset.view;
  const id = form.dataset.id;
  const config = entityConfig[view];
  if (!config) return;
  const record = Object.fromEntries(new FormData(form));
  config.fields.forEach((field) => {
    if (field.type === "number" && record[field.key] !== "") record[field.key] = Number(record[field.key]);
  });
  if (id) {
    data[view] = data[view].map((item) => item.id === id ? { ...item, ...record } : item);
  } else {
    data[view].unshift({ id: makeId(), ...record });
  }
  closeModal();
  render();
  showToast(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} ${id ? "updated" : "added"} in demo data.`);
};

const deleteRecord = (view, id) => {
  const config = entityConfig[view];
  const record = data[view]?.find((item) => item.id === id);
  if (!config || !record || !window.confirm(`Delete this fictional ${config.singular}?`)) return;
  data[view] = data[view].filter((item) => item.id !== id);
  render();
  showToast("Demo record deleted.");
};

const convertLead = (view, id) => {
  const source = view === "landlordLeads" ? "landlordLeads" : "tenantLeads";
  const destination = view === "landlordLeads" ? "landlords" : "tenants";
  const lead = data[source].find((item) => item.id === id);
  if (!lead || lead.status === "Converted") return;
  data[destination].unshift({
    id: makeId(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: view === "landlordLeads" ? "Onboarding" : "Application",
    ...(view === "landlordLeads" ? { properties: 0 } : { property: lead.property || "" }),
    notes: `Created from fictional demo lead. ${lead.notes || ""}`.trim()
  });
  data[source] = data[source].map((item) => item.id === id ? { ...item, status: "Converted" } : item);
  render();
  showToast("Lead converted to a demo account record.");
};

const downloadFile = (name, type, content) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

const exportJson = () => downloadFile("shm-demo-data.json", "application/json", JSON.stringify(data, null, 2));
const csvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const exportCsv = () => {
  const rows = [["Section", "Record", "Status", "Email", "Date"]];
  dataViews.forEach((view) => data[view].forEach((record) => rows.push([
    entityConfig[view].label,
    record.name || record.address || record.title || record.property || "",
    record.status || record.priority || "",
    record.email || "",
    record.date || record.due || ""
  ])));
  downloadFile("shm-demo-report.csv", "text/csv;charset=utf-8", rows.map((row) => row.map(csvValue).join(",")).join("\r\n"));
};

const importJson = async () => {
  const file = document.querySelector("#importFile")?.files?.[0];
  if (!file) {
    showToast("Choose a JSON demo backup first.");
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    if (!validateData(parsed)) throw new Error("This file is not a valid SHM demo data backup.");
    if (!window.confirm("Replace the current fictional demo records with this backup?")) return;
    data = parsed;
    render();
    showToast("Demo data backup imported.");
  } catch (error) {
    showToast(`Import failed: ${error.message}`);
  }
};

sideNav?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  activeView = button.dataset.view;
  searchTerm = "";
  statusFilter = "";
  sidebar.classList.remove("open");
  document.querySelector("#mobileMenu")?.setAttribute("aria-expanded", "false");
  render();
});

document.querySelector("#mobileMenu")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const open = !sidebar.classList.contains("open");
  sidebar.classList.toggle("open", open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, view, id } = button.dataset;
  if (action === "navigate") {
    activeView = view;
    render();
  } else if (action === "add") {
    openModal(view);
  } else if (action === "edit") {
    openModal(view, data[view]?.find((record) => record.id === id));
  } else if (action === "delete") {
    deleteRecord(view, id);
  } else if (action === "convert") {
    convertLead(view, id);
  } else if (action === "close-modal") {
    if (event.target === button || button.matches(".modal-close")) closeModal();
  } else if (action === "view-leads") {
    activeView = "landlordLeads";
    render();
  } else if (action === "reset") {
    if (!window.confirm("Reset this tab's demo records to the original fictional examples?")) return;
    data = makeSampleData();
    searchTerm = "";
    statusFilter = "";
    render();
    showToast("Demo data reset.");
  } else if (action === "export-json") {
    exportJson();
  } else if (action === "export-csv") {
    exportCsv();
  } else if (action === "import-json") {
    importJson();
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "recordForm") return;
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  updateRecord(event.target);
});

document.addEventListener("input", (event) => {
  if (event.target.id !== "recordSearch") return;
  searchTerm = event.target.value.trim();
  const selectionStart = event.target.selectionStart;
  render();
  const nextSearch = document.querySelector("#recordSearch");
  nextSearch?.focus();
  nextSearch?.setSelectionRange(selectionStart, selectionStart);
});

document.addEventListener("change", (event) => {
  if (event.target.id !== "statusFilter") return;
  statusFilter = event.target.value;
  render();
});

document.querySelector("#resetDemo")?.addEventListener("click", () => {
  activeView = "settings";
  render();
  document.querySelector('[data-action="reset"]')?.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalRoot.firstElementChild) closeModal();
});

render();
