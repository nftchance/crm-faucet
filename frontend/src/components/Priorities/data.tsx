import type { Column, Entities, TaskMap, Task, Id } from './types';

const tasks: Task[] = [
    {
        id: 'reddit',
        content: 'Reddit',
    },
    {
        id: 'twitter',
        content: 'Twitter',
    },
    {
        id: 'telegram',
        content: 'Telegram',
    },
    { 
        id: 'ethereum',
        content: 'Ethereum Wallet',
    }, { 
        id: 'discord',
        content: 'Discord',
    }, { 
        id: 'github',
        content: 'Github',
    }
];        


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

const sizes = {
    Sample: 5,
    Medium: 10,
    Large: 20,
    XLarge: 50,
    XXLarge: 100,
}

const entities: Entities = {
    columnOrder: [priorities.id],
    columns: {
        [priorities.id]: priorities
    },
    tasks: taskMap,
};

export { entities, sizes };