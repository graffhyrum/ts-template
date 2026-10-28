import type { TenantId, TodoId } from "./validation.ts";

export type Tenant = {
  readonly id: TenantId;
  readonly name: string;
};

export type Todo = {
  readonly id: TodoId;
  readonly tenantId: TenantId;
  readonly title: string;
  readonly done: boolean;
  readonly createdAt: number;
};

export type Store = {
  readonly createTenant: (name: string) => Tenant | undefined;
  readonly listTenants: () => readonly Tenant[];
  readonly getTenant: (id: TenantId) => Tenant | undefined;
  readonly createTodo: (tenantId: TenantId, title: string) => Todo | undefined;
  readonly listTodos: (tenantId: TenantId) => readonly Todo[];
  readonly getTodo: (id: TodoId) => Todo | undefined;
  readonly toggleTodo: (id: TodoId) => Todo | undefined;
  readonly deleteTodo: (id: TodoId) => boolean;
  readonly todoBelongsToTenant: (todoId: TodoId, tenantId: TenantId) => boolean;
};

export function createStore(): Store {
  const tenants = new Map<TenantId, Tenant>();
  const todos = new Map<TodoId, Todo>();

  return {
    createTenant: (name) => createTenantRecord(name, tenants),
    listTenants: () => [...tenants.values()],
    getTenant: (id) => tenants.get(id),
    createTodo: (tenantId, title) =>
      createTodoRecord(tenantId, title, tenants, todos),
    listTodos: (tenantId) => listTodosForTenant(tenantId, todos),
    getTodo: (id) => todos.get(id),
    toggleTodo: (id) => toggleTodoRecord(id, todos),
    deleteTodo: (id) => deleteTodoRecord(id, todos),
    todoBelongsToTenant: (todoId, tenantId) =>
      isOwnedBy(todoId, tenantId, todos),
  };
}

function createTenantRecord(
  name: string,
  tenants: Map<TenantId, Tenant>,
): Tenant | undefined {
  const trimmed = name.trim();
  if (trimmed.length === 0) return undefined;
  const tenant: Tenant = { id: newTenantId(), name: trimmed };
  tenants.set(tenant.id, tenant);
  return tenant;
}

function createTodoRecord(
  tenantId: TenantId,
  title: string,
  tenants: Map<TenantId, Tenant>,
  todos: Map<TodoId, Todo>,
): Todo | undefined {
  if (!tenants.has(tenantId)) return undefined;
  const trimmed = title.trim();
  if (trimmed.length === 0) return undefined;
  const todo: Todo = {
    id: newTodoId(),
    tenantId,
    title: trimmed,
    done: false,
    createdAt: Date.now(),
  };
  todos.set(todo.id, todo);
  return todo;
}

function listTodosForTenant(
  tenantId: TenantId,
  todos: Map<TodoId, Todo>,
): readonly Todo[] {
  return [...todos.values()].filter((todo) => todo.tenantId === tenantId);
}

function toggleTodoRecord(
  id: TodoId,
  todos: Map<TodoId, Todo>,
): Todo | undefined {
  const existing = todos.get(id);
  if (existing === undefined) return undefined;
  const updated: Todo = { ...existing, done: !existing.done };
  todos.set(id, updated);
  return updated;
}

function deleteTodoRecord(id: TodoId, todos: Map<TodoId, Todo>): boolean {
  return todos.delete(id);
}

function isOwnedBy(
  todoId: TodoId,
  tenantId: TenantId,
  todos: Map<TodoId, Todo>,
): boolean {
  const todo = todos.get(todoId);
  if (todo === undefined) return false;
  return todo.tenantId === tenantId;
}

function newTenantId(): TenantId {
  return `tenant-${crypto.randomUUID()}` as TenantId;
}

function newTodoId(): TodoId {
  return `todo-${crypto.randomUUID()}` as TodoId;
}
