"use client";

import { useEffect, useState } from "react";
import { DEMO_TASKS, type Task } from "@/lib/workspace-shared";

const KEY = "greenstamp_demo_tasks_v1";

export function useDemoTasks(initialTasks: Task[], isDemo = true) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isDemo) {
      setTasks(initialTasks);
      setHydrated(true);
      return;
    }
    try {
      const base = initialTasks.length > 0 ? initialTasks : DEMO_TASKS;
      const stored = window.localStorage.getItem(KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Task[];
        if (Array.isArray(parsed)) {
          const merged = new Map<string, Task>(base.map((task) => [task.id, task]));
          for (const task of parsed) merged.set(task.id, task);
          setTasks([...merged.values()]);
        }
      } else {
        setTasks(base);
      }
    } catch {
      setTasks(initialTasks.length > 0 ? initialTasks : DEMO_TASKS);
    }
    setHydrated(true);
  // Demo localStorage is hydrated once; real server data refreshes when the props update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, initialTasks]);

  function updateTasks(updater: (current: Task[]) => Task[]) {
    setTasks((current) => {
      const next = updater(current);
      if (isDemo) {
        try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Preview remains usable in memory. */ }
      }
      return next;
    });
  }
  return { tasks, updateTasks, hydrated };
}
