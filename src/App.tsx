import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Search,
  Moon,
  Sun,
  Kanban,
  CalendarDays,
  BarChart3,
  Settings,
  Home,
  Filter,
  MoreVertical,
  Clock3,
  ChevronRight,
  ChevronLeft,
  Star,
  FolderKanban,
  User,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

/** Tema Space Tech — verde escuro + responsivo 1366x768 */

type Task = {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  priority?: "Alta" | "Média" | "Baixa";
  points?: number;
  due?: string;
  assignees?: string[];
};

type Column = { id: string; title: string; taskIds: string[] };

// --------------------------- Mock Data --------------------------- //
const initialTasks: Record<string, Task> = {
  t1: {
    id: "t1",
    title: "Brainstorm homepage hero",
    description: "Explorar três variações com foco no CTA",
    labels: ["UI", "Design"],
    priority: "Alta",
    points: 5,
    due: "2025-09-03",
    assignees: ["EV", "AN"],
  },
  t2: {
    id: "t2",
    title: "Setup Auth flow",
    description: "Login, registro e reset senha sem backend (mock)",
    labels: ["Frontend"],
    priority: "Média",
    points: 3,
    due: "2025-09-10",
    assignees: ["JP"],
  },
  t3: {
    id: "t3",
    title: "Kanban drag & drop",
    description: "Mover cards entre colunas e reordenar",
    labels: ["Feature"],
    priority: "Alta",
    points: 8,
    due: "2025-09-01",
    assignees: ["EV", "KA"],
  },
  t4: {
    id: "t4",
    title: "Tema Claro/Escuro",
    description: "Persistir preferência no localStorage",
    labels: ["UX"],
    priority: "Baixa",
    points: 2,
    due: "2025-09-12",
    assignees: ["AN"],
  },
  t5: {
    id: "t5",
    title: "Dashboard de métricas",
    description: "Horas totais e distribuição por área",
    labels: ["Analytics"],
    priority: "Média",
    points: 3,
    due: "2025-09-18",
    assignees: ["JP"],
  },
};

const initialColumns: Record<string, Column> = {
  backlog: { id: "backlog", title: "Backlog", taskIds: ["t1", "t2"] },
  progress: { id: "progress", title: "Em progresso", taskIds: ["t3"] },
  review: { id: "review", title: "Revisão", taskIds: ["t4"] },
  done: { id: "done", title: "Concluído", taskIds: ["t5"] },
};
const initialColumnOrder = ["backlog", "progress", "review", "done"];

// --------------------------- Helpers --------------------------- //
// Paleta Space Tech (verdes/teal, zero rosa)
const GREEN_A = "#0b1512"; // fundo
const GREEN_B = "#10372f"; // verde petróleo
const GREEN_C = "#0f5f3a"; // verde médio
const GREEN_ACCENT_1 = "#16a34a";
const GREEN_ACCENT_2 = "#10b981";
const GREEN_ACCENT_3 = "#22c55e";

// tags verdes
const tagColors: Record<string, string> = {
  UI: "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/20",
  Design: "bg-green-500/15  text-green-300  ring-1 ring-inset ring-green-500/20",
  Frontend: "bg-teal-500/15   text-teal-300   ring-1 ring-inset ring-teal-500/20",
  Feature: "bg-lime-500/15   text-lime-300   ring-1 ring-inset ring-lime-500/20",
  UX: "bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/20",
  Analytics: "bg-green-400/15  text-green-200  ring-1 ring-inset ring-green-400/20",
};

const priorityBadge = (p?: string) =>
  ({
    Alta: "bg-red-500/15 text-red-300 ring-1 ring-red-500/20",
    Média: "bg-yellow-500/15 text-yellow-200 ring-1 ring-yellow-500/20",
    Baixa: "bg-lime-500/15 text-lime-200 ring-1 ring-lime-500/20",
  } as Record<string, string>)[p || "Média"];

// Avatar pastel
function Avatar({ name }: { name: string }) {
  const hue = useMemo(
    () => name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360,
    [name],
  );
  return (
    <div
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold shadow-sm"
      style={{ background: `hsl(${hue} 70% 20% / .8)`, color: "#fff" }}
      title={name}
    >
      {name}
    </div>
  );
}

// --------------------------- Sortable Task Card --------------------------- //
function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        layout
        className={
          `group relative rounded-2xl border border-white/5 bg-gradient-to-br ` +
          `from-white/5 to-white/0 p-3 shadow-sm backdrop-blur ` +
          (isDragging ? "ring-2 ring-emerald-500/60" : "hover:ring-1 hover:ring-white/10")
        }
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 size-2.5 shrink-0 rounded-full bg-gradient-to-b from-emerald-400 to-green-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-sm font-semibold tracking-tight">
                {task.title}
              </h4>
              <button className="opacity-60 transition hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs/5 opacity-70">{task.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {task.labels?.map((l) => (
                <span
                  key={l}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${tagColors[l] || "bg-white/5"}`}
                >
                  {l}
                </span>
              ))}
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${priorityBadge(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex -space-x-2">
                {task.assignees?.map((n) => (
                  <div key={n} className="ring-2 ring-black/20 rounded-full bg-black -m-px">
                    <Avatar name={n} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[11px] opacity-70">
                <Clock3 className="h-3.5 w-3.5" /> {task.due}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --------------------------- Column --------------------------- //
function Column({
  column,
  tasks,
  onAdd,
}: {
  column: Column;
  tasks: Record<string, Task>;
  onAdd: (columnId: string) => void;
}) {
  const totalPoints = column.taskIds.reduce((acc, id) => acc + (tasks[id]?.points || 0), 0);
  return (
    <div className="flex h-full w-[300px] md:w-[320px] flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">{column.title}</h3>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] opacity-80">
              {column.taskIds.length}
            </span>
          </div>
          <p className="text-[11px] opacity-60">{totalPoints} pts</p>
        </div>
        <button
          onClick={() => onAdd(column.id)}
          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 px-2.5 py-1 text-[11px] font-medium text-white shadow-md transition hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Card
        </button>
      </div>

      <div className="h-px w-full bg-white/10" />

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
        <SortableContext items={column.taskIds} strategy={verticalListSortingStrategy}>
          {column.taskIds.map((taskId) => (
            <TaskCard key={taskId} task={tasks[taskId]} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

/* --------------------------- Sidebar (estilo mock) --------------------------- */
function Sidebar({
  theme,
  setTheme,
  active,
  onNavigate,
  projectsBadge,
}: {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
  active: string;
  onNavigate: (id: string) => void;
  projectsBadge: number;
}) {
  const [open, setOpen] = React.useState(true);

  const items = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "projetos", label: "Projetos", icon: Kanban, badge: projectsBadge },
    { id: "calendario", label: "Calendário", icon: CalendarDays },
    { id: "estatisticas", label: "Estatísticas", icon: BarChart3 },
    { id: "config", label: "Configurações", icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: open ? 240 : 76 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="
        sticky top-4 self-start
        relative min-h-[76vh] rounded-[28px] border border-white/10
        bg-[#0e1412]/90 backdrop-blur shadow-[inset_0_1px_0_rgba(255,255,255,.06)]
        flex flex-col p-3
      "
      style={{
        backgroundImage:
          "radial-gradient(1200px 500px at -200px -200px, rgba(16,185,129,0.10), transparent 60%)",
      }}
    >
      {/* topo: logo + toggle */}
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div
          className="grid size-9 place-items-center rounded-lg text-white font-bold shadow"
          style={{ background: "linear-gradient(180deg,#16a34a,#22c55e)" }}
        >
          N
        </div>

        {open && (
          <div className="ml-1 text-sm font-semibold text-white/90 tracking-wide">
            Space Tech
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="ml-auto grid size-9 place-items-center rounded-lg bg-white/5 text-white/80 hover:bg-white/10"
          title={open ? "Recolher" : "Expandir"}
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <div className="mx-1 mb-3 h-px bg-white/10" />

      {/* navegação */}
      <nav className="flex-1 space-y-1.5">
        {items.map(({ id, label, icon: Icon, badge }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                group relative w-full overflow-hidden rounded-2xl
                ${isActive ? "bg-white/5" : "hover:bg-white/5"}
                transition
              `}
            >
              {/* acento lateral */}
              <span
                className={`
                  absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-r-full
                  ${isActive ? "bg-gradient-to-b from-emerald-500 to-lime-400" : "bg-transparent"}
                `}
              />
              <div
                className={`flex items-center ${
                  open ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
                }`}
              >
                <div
                  className={`grid size-10 place-items-center rounded-xl ${
                    isActive
                      ? "bg-gradient-to-b from-emerald-600/30 to-lime-500/25"
                      : "bg-white/5"
                  } text-white`}
                >
                  <Icon className="h-4.5 w-4.5 opacity-90" />
                </div>

                {open && (
                  <div className="flex min-w-0 flex-1 items-center">
                    <span
                      className={`truncate text-sm ${
                        isActive ? "text-white" : "text-white/80 group-hover:text-white"
                      }`}
                    >
                      {label}
                    </span>

                    {badge != null && (
                      <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/90">
                        {badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* rodapé: tema + “avatar” */}
      <div className="mt-3 space-y-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`w-full rounded-2xl px-3 py-2.5 text-sm text-white/90 transition
            ${open ? "flex items-center gap-3" : "grid place-items-center"}
            bg-white/5 hover:bg-white/10`}
          title="Alternar tema"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-white/5 text-white">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </div>
          {open && <span>Tema {theme === "dark" ? "claro" : "escuro"}</span>}
        </button>

        <div className={`mx-auto ${open ? "w-full" : ""} rounded-2xl bg-white/5 p-2.5`}>
          <div className={`${open ? "flex items-center gap-3" : "grid place-items-center"}`}>
            <div
              className="relative grid size-10 place-items-center rounded-full text-[13px] font-bold text-white"
              style={{
                background:
                  "conic-gradient(from 180deg at 50% 50%, #16a34a, #22c55e, #16a34a)",
              }}
            >
              <span className="grid size-8 place-items-center rounded-full bg-[#0e1412]">
                EV
              </span>
            </div>
            {open && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">Equipe</div>
                <div className="truncate text-[11px] text-white/70 -mt-0.5">Online</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

/* --------------------------- Header --------------------------- */
function Header({
  onAddGlobal,
  setQuery,
}: {
  onAddGlobal: () => void;
  setQuery: (s: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-3 pr-4 backdrop-blur">
      <div className="flex h-14 flex-1 items-center gap-3 rounded-2xl bg-white/5 pl-3 pr-2">
        <Search className="h-5 w-5 opacity-60" />
        <input
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tarefas, pessoas, tags…"
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
        />
        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-white/5 px-2 py-1 text-xs opacity-75 hover:opacity-100">
            <Filter className="mr-1 inline-block h-4 w-4" /> Filtros
          </button>
          <button
            onClick={onAddGlobal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 px-3 py-2 text-sm font-medium text-white shadow"
          >
            <Plus className="h-4 w-4" /> Nova tarefa
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Avatar name="EV" />
        <Avatar name="AN" />
        <Avatar name="JP" />
      </div>
    </div>
  );
}

/* --------------------------- Analytics Card --------------------------- */
function HoursCard() {
  const data = [
    { name: "Design", value: 34 },
    { name: "Frontend", value: 41 },
    { name: "PM", value: 25 },
  ];
  const COLORS = [GREEN_ACCENT_1, GREEN_ACCENT_2, GREEN_ACCENT_3];
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">Horas totais</p>
        <BarChart3 className="h-4 w-4 opacity-70" />
      </div>
      <div className="h-36 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={36} outerRadius={60} paddingAngle={3} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.9} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center text-2xl font-bold tracking-tight">{12340}h</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
        {data.map((d, i) => (
          <div
            key={d.name}
            className="flex items-center justify-center gap-1 rounded-xl bg-white/5 px-2 py-1"
          >
            <span className="size-2 rounded-full" style={{ background: COLORS[i] }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Right Rail --------------------------- */
function RightRail() {
  const activity = [
    { who: "EV", text: 'moveu "Kanban drag & drop" para Revisão' },
    { who: "AN", text: 'comentou em "Tema Claro/Escuro"' },
    { who: "JP", text: 'concluiu "Dashboard de métricas"' },
  ];
  return (
    <div className="flex w-64 md:w-72 flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
      <div
        className="rounded-2xl p-3 text-sm"
        style={{
          background: `linear-gradient(135deg, ${GREEN_B}33 0%, ${GREEN_C}33 100%)`,
        }}
      >
        <div className="mb-1 flex items-center gap-2 font-semibold">
          <FolderKanban className="h-4 w-4" /> Sua semana
        </div>
        <p className="opacity-80">3 entregas pendentes • 2 revisões</p>
      </div>
      <HoursCard />
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-3">
        <p className="mb-2 text-sm font-semibold">Atividades</p>
        <div className="space-y-2">
          {activity.map((a, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
              <Avatar name={a.who} />
              <p className="text-xs opacity-80">{a.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Hook: section spy --------------------------- */
function useSectionSpy(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0]);

  useEffect(() => {
    // scroll suave global
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        // pega a entrada mais visível
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      {
        // a seção é considerada ativa quando o centro dela entra na viewport
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => obs.observe(el));
    return () => {
      html.style.scrollBehavior = previous;
      obs.disconnect();
    };
  }, [ids.join(",")]);

  return { active, setActive };
}

/* --------------------------- Main App --------------------------- */
export default function ProjectOS() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [tasks, setTasks] = useState<Record<string, Task>>(initialTasks);
  const [columns, setColumns] = useState<Record<string, Column>>(initialColumns);
  const [columnOrder, setColumnOrder] = useState<string[]>(initialColumnOrder);
  const [query, setQuery] = useState("");

  // seções para o spy
  const sectionIds = ["perfil", "dashboard", "projetos", "calendario", "estatisticas", "config"];
  const { active, setActive } = useSectionSpy(sectionIds);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function findContainer(id: string) {
    if (columns[id]) return id;
    return (Object.values(columns).find((col) => col.taskIds.includes(id))?.id) as
      | string
      | undefined;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const fromId = findContainer(String(active.id));
    const toId = findContainer(String(over.id));
    if (!fromId || !toId) return;

    if (fromId === toId) {
      const col = columns[fromId];
      const oldIndex = col.taskIds.indexOf(String(active.id));
      const newIndex = col.taskIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const newTaskIds = arrayMove(col.taskIds, oldIndex, newIndex);
      setColumns({ ...columns, [fromId]: { ...col, taskIds: newTaskIds } });
    } else {
      const fromCol = columns[fromId];
      const toCol = columns[toId];
      const activeIndex = fromCol.taskIds.indexOf(String(active.id));
      const overIndex = toCol.taskIds.indexOf(String(over.id));

      const newFrom = [...fromCol.taskIds];
      newFrom.splice(activeIndex, 1);

      const newTo = [...toCol.taskIds];
      if (overIndex === -1) newTo.push(String(active.id));
      else newTo.splice(overIndex, 0, String(active.id));

      setColumns({
        ...columns,
        [fromId]: { ...fromCol, taskIds: newFrom },
        [toId]: { ...toCol, taskIds: newTo },
      });
    }
  }

  function addTask(columnId?: string) {
    const id = `t${Math.random().toString(36).slice(2, 8)}`;
    const newTask: Task = {
      id,
      title: "Nova tarefa",
      description: "Descreva aqui…",
      labels: ["Frontend"],
      priority: "Média",
      points: 1,
      due: new Date().toISOString().slice(0, 10),
      assignees: ["EV"],
    };
    setTasks({ ...tasks, [id]: newTask });
    if (columnId) {
      setColumns({
        ...columns,
        [columnId]: { ...columns[columnId], taskIds: [id, ...columns[columnId].taskIds] },
      });
    } else {
      setColumns({
        ...columns,
        backlog: { ...columns.backlog, taskIds: [id, ...columns.backlog.taskIds] },
      });
    }
  }

  const filteredColumns = React.useMemo(() => {
    if (!query.trim()) return columns;
    const q = query.toLowerCase();
    const newCols: Record<string, Column> = {} as any;
    for (const col of Object.values(columns)) {
      const ids = col.taskIds.filter((id) => {
        const t = tasks[id];
        const hay = `${t.title} ${t.description} ${t.labels?.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
      newCols[col.id] = { ...col, taskIds: ids };
    }
    return newCols;
  }, [columns, query, tasks]);

  // badge dinâmico dos projetos = em progresso
  const projectsBadge = columns.progress?.taskIds.length ?? 0;

  function navigateTo(id: string) {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={
        theme === "dark"
          ? "min-h-screen text-white px-4 md:px-6 py-4 overflow-x-hidden"
          : "min-h-screen bg-slate-100 text-slate-900 px-4 md:px-6 py-4 overflow-x-hidden"
      }
      style={{ background: GREEN_A }}
    >
      <div className="mx-auto w-full max-w-[1440px]">
        {/* Top Row */}
        <div className="grid grid-cols-[auto_1fr] items-start gap-4">
          <Sidebar
            theme={theme}
            setTheme={setTheme}
            active={active}
            onNavigate={navigateTo}
            projectsBadge={projectsBadge}
          />

          <div className="space-y-6">
            {/* PERFIL */}
            <section id="perfil" className="scroll-mt-24">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-12 place-items-center rounded-xl text-white font-bold"
                      style={{ background: "linear-gradient(180deg,#16a34a,#22c55e)" }}
                    >
                      N
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Bem-vindo(a)</div>
                      <div className="text-lg font-semibold">Space Tech — ProjectOS</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar name="EV" />
                    <Avatar name="AN" />
                    <Avatar name="JP" />
                  </div>
                </div>
              </div>
            </section>

            {/* Header / busca */}
            <Header onAddGlobal={() => addTask()} setQuery={setQuery} />

            {/* DASHBOARD (hero + rail) */}
            <section id="dashboard" className="scroll-mt-24">
              <div className="grid grid-cols-[1fr_280px] md:grid-cols-[1fr_300px] gap-4">
                <div
                  className="rounded-3xl border border-white/10 p-6 backdrop-blur"
                  style={{
                    background: `linear-gradient(135deg, ${GREEN_B}CC 0%, ${GREEN_A} 55%, ${GREEN_C}66 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                        <Star className="h-3.5 w-3.5" /> Projeto em destaque
                      </div>
                      <h2 className="text-2xl font-extrabold tracking-tight">
                        Workspace — ProjectOS
                      </h2>
                      <p className="mt-1 max-w-xl text-sm opacity-80">
                        Um sistema de gestão de projetos inspirado em Notion/Trello com foco em
                        praticidade e velocidade.
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <button
                          onClick={() => addTask("progress")}
                          className="rounded-xl bg-white/10 px-3 py-1.5 font-medium hover:bg-white/15"
                        >
                          Adicionar ao "Em progresso"
                        </button>
                        <button className="rounded-xl bg-white/10 px-3 py-1.5 hover:bg-white/15">
                          Compartilhar
                        </button>
                      </div>
                    </div>
                    <div className="hidden items-center gap-3 md:flex">
                      <div
                        className="grid size-14 place-items-center rounded-2xl"
                        style={{ background: `${GREEN_B}66`, color: "#fff" }}
                      >
                        PO
                      </div>
                      <ChevronRight className="h-8 w-8 opacity-60" />
                      <div
                        className="grid size-14 place-items-center rounded-2xl text-3xl font-black text-white shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${GREEN_C} 0%, ${GREEN_ACCENT_1} 100%)`,
                        }}
                      >
                        V2
                      </div>
                    </div>
                  </div>
                </div>
                <RightRail />
              </div>
            </section>

            {/* PROJETOS (Board) */}
            <section id="projetos" className="scroll-mt-24">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm opacity-80">
                    <Kanban className="h-4 w-4" /> Boards • Sprint 14
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-xl bg-white/5 px-2 py-1 text-xs opacity-75 hover:opacity-100">
                      Ordenar
                    </button>
                    <button className="rounded-xl bg-white/5 px-2 py-1 text-xs opacity-75 hover:opacity-100">
                      Exportar
                    </button>
                  </div>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {columnOrder.map((colId) => (
                      <SortableContext
                        key={colId}
                        items={filteredColumns[colId]?.taskIds || []}
                      >
                        <Column
                          column={filteredColumns[colId]}
                          tasks={tasks}
                          onAdd={(id) => addTask(id)}
                        />
                      </SortableContext>
                    ))}

                    {/* Nova coluna */}
                    <button
                      className="h-[520px] w-[240px] md:w-[260px] shrink-0 rounded-3xl border border-dashed border-white/20 p-4 text-left opacity-70 transition hover:opacity-100"
                      onClick={() => {
                        const id = `c${Math.random().toString(36).slice(2, 7)}`;
                        const title = `Nova coluna`;
                        setColumns({ ...columns, [id]: { id, title, taskIds: [] } });
                        setColumnOrder([...columnOrder, id]);
                      }}
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl bg-white/5">
                        <Plus className="h-5 w-5" />
                        Adicionar coluna
                      </div>
                    </button>
                  </div>
                </DndContext>
              </div>
            </section>

            {/* CALENDÁRIO (placeholder) */}
            <section id="calendario" className="scroll-mt-24">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
                <div className="mb-2 flex items-center gap-2 text-sm opacity-80">
                  <CalendarDays className="h-4 w-4" /> Calendário
                </div>
                <p className="text-sm opacity-80">
                  Integração de agenda/calen­dário (em breve).
                </p>
              </div>
            </section>

            {/* ESTATÍSTICAS (card grande para facilitar o spy) */}
            <section id="estatisticas" className="scroll-mt-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <HoursCard />
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
                  <p className="text-sm font-semibold">Conversões</p>
                  <p className="mt-1 text-sm opacity-80">
                    Espaço para gráficos adicionais (linhas/barras).
                  </p>
                </div>
              </div>
            </section>

            {/* CONFIG */}
            <section id="config" className="scroll-mt-24">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
                <div className="mb-2 flex items-center gap-2 text-sm opacity-80">
                  <Settings className="h-4 w-4" /> Configurações
                </div>
                <p className="text-sm opacity-80">
                  Preferências, membros e integrações.
                </p>
              </div>
            </section>

            {/* Rodapé */}
            <div className="mt-2 text-center text-xs opacity-60">
              © 2025 Space Tech. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
