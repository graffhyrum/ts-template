type Tenant = { id: string; name: string };
type Todo = { id: string; tenantId: string; title: string; done: boolean };

const tenantSelect =
  typeof document !== "undefined"
    ? (document.getElementById("tenant") as HTMLSelectElement | null)
    : null;
const newTenantInput =
  typeof document !== "undefined"
    ? (document.getElementById("new-tenant") as HTMLInputElement | null)
    : null;
const addTenantButton =
  typeof document !== "undefined"
    ? (document.getElementById("add-tenant") as HTMLButtonElement | null)
    : null;
const newTodoInput =
  typeof document !== "undefined"
    ? (document.getElementById("new-todo") as HTMLInputElement | null)
    : null;
const addTodoButton =
  typeof document !== "undefined"
    ? (document.getElementById("add-todo") as HTMLButtonElement | null)
    : null;
const todosContainer =
  typeof document !== "undefined"
    ? (document.getElementById("todos") as HTMLDivElement | null)
    : null;

let currentTenantId: string | undefined;

function wireEvents(): void {
  tenantSelect?.addEventListener("change", () => {
    currentTenantId = tenantSelect.value;
    void loadTodos();
  });
  addTenantButton?.addEventListener("click", () => {
    void addTenant();
  });
  addTodoButton?.addEventListener("click", () => {
    void addTodo();
  });
  todosContainer?.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement | null;
    if (target?.dataset.id !== undefined) {
      void toggleTodo(target.dataset.id);
    }
  });
  todosContainer?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const id = target?.dataset.delete;
    if (id !== undefined) void deleteTodo(id);
  });
}

async function addTenant(): Promise<void> {
  const name = newTenantInput?.value ?? "";
  await fetch("/api/tenants", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (newTenantInput !== null) newTenantInput.value = "";
  await loadTenants();
}

async function addTodo(): Promise<void> {
  const title = newTodoInput?.value ?? "";
  if (currentTenantId === undefined) return;
  await fetch("/api/todos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tenantId: currentTenantId, title }),
  });
  if (newTodoInput !== null) newTodoInput.value = "";
  await loadTodos();
}

async function toggleTodo(id: string): Promise<void> {
  if (currentTenantId === undefined) return;
  await fetch(`/api/todos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tenantId: currentTenantId }),
  });
  await loadTodos();
}

async function deleteTodo(id: string): Promise<void> {
  if (currentTenantId === undefined) return;
  await fetch(
    `/api/todos/${encodeURIComponent(id)}?tenantId=${encodeURIComponent(currentTenantId)}`,
    {
      method: "DELETE",
    },
  );
  await loadTodos();
}

async function loadTenants(): Promise<void> {
  const response = await fetch("/api/tenants");
  const tenants = (await response.json()) as Tenant[];
  if (tenantSelect !== null) {
    tenantSelect.innerHTML = renderTenantOptions(tenants);
  }
  if (tenants.length > 0 && currentTenantId === undefined) {
    currentTenantId = tenants[0]?.id;
    if (tenantSelect !== null && currentTenantId !== undefined) {
      tenantSelect.value = currentTenantId;
    }
  }
  await loadTodos();
}

async function loadTodos(): Promise<void> {
  if (currentTenantId === undefined) return;
  const response = await fetch(
    `/api/todos?tenantId=${encodeURIComponent(currentTenantId)}`,
  );
  const todos = (await response.json()) as Todo[];
  if (todosContainer !== null) {
    todosContainer.innerHTML = renderTodos(todos);
  }
}

export function renderTenantOptions(tenants: readonly Tenant[]): string {
  return tenants
    .map(
      (tenant) =>
        `<option value="${escapeHtml(tenant.id)}">${escapeHtml(tenant.name)}</option>`,
    )
    .join("");
}

export function renderTodos(todos: readonly Todo[]): string {
  return todos
    .map(
      (todo) =>
        `<div class="todo"><input type="checkbox" data-id="${escapeHtml(todo.id)}" ${todo.done ? "checked" : ""}/><span class="${todo.done ? "done" : ""}">${escapeHtml(todo.title)}</span><button data-delete="${escapeHtml(todo.id)}">x</button></div>`,
    )
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

if (typeof document !== "undefined") {
  wireEvents();
  void loadTenants();
}
