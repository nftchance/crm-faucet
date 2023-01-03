import type { Column, Entities, TaskMap, Task, Id } from './types';

const tasks: Task[] = Array.from({ length: 7 }, (v, k) => k).map(
    (val: number): Task => ({
        id: `task-${val}`,
        content: `Task ${val}`,
    }),
);

const taskMap: TaskMap = tasks.reduce(
    (previous: TaskMap, current: Task): TaskMap => {
        previous[current.id] = current;
        return previous;
    },
    {},
);

const priorities: Column = {
    id: 'priorities',
    title: 'Priorities',
    taskIds: tasks.map((task: Task): Id => task.id),
};

const entities: Entities = {
    columnOrder: [priorities.id],
    columns: {
        [priorities.id]: priorities
    },
    tasks: taskMap,
};

export default entities;