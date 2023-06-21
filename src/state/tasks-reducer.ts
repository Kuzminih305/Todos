import { TasksStateType } from '../App';
import {AddTodolistActionType, RemoveTodolistActionType, SetTodoListACType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";
import {setErrorAC, SetErrorActionType, setStatusAC, SetStatusActionType} from "./app-reducer";

export type RemoveTaskActionType = ReturnType<typeof removeTaskAC>
export type AddTaskActionType = ReturnType<typeof addTaskAC>
export type UpdateTaskActionType = ReturnType<typeof updateTaskStatusAC>
export type SetTaskActionType = ReturnType<typeof setTasksAC>

export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}

type ActionsType = RemoveTaskActionType | AddTaskActionType
    | UpdateTaskActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodoListACType
    | SetTaskActionType
    | SetStatusActionType
    | SetErrorActionType

const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        case 'ADD-TASK':
           return {...state,[action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
        case 'UPDATE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].map(t => t.id === action.taskId ? {...t, ...action.model} : t)}
        case 'ADD-TODOLIST':
            return {...state, [action.todoList.id]: []}
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.todolistId];
            return copyState;
        }
        case "SET-TODOLIST": {
            const copyState = {...state}
            action.todoList.forEach( (tl) => {copyState[tl.id] = []})
            return copyState
        }
        case "SET-TASKS":
            return {...state, [action.todoListId]: action.tasks}
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string) => {
    return{
        type: 'REMOVE-TASK',
        taskId,
        todolistId
    } as const
}
export const addTaskAC = (task: TaskType) => {
    return {
        type: 'ADD-TASK',
        task
    } as const
}
export const updateTaskStatusAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) => {
    return {
        type: 'UPDATE-TASK',
        model,
        todolistId,
        taskId
    } as const
}
export const setTasksAC = (todoListId: string, tasks: TaskType[]) => {
    return {
        type: "SET-TASKS",
        todoListId,
        tasks
    } as const
}
//-------------------THUNK------------------------

export const setTasksTC = (todoListId: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setStatusAC('loading'))
        todolistsAPI.getTasks(todoListId)
            .then((res)=> {
                dispatch(setTasksAC(todoListId, res.data.items))
                dispatch(setStatusAC('succeeded'))
            })
    }
}

export const addTaskTC = (todoListId: string, title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setStatusAC('loading'))
        todolistsAPI.createTask(todoListId, title)
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(addTaskAC(res.data.data.item))
                dispatch(setStatusAC('succeeded'))
            } else {
                if (res.data.messages.length) {
                    dispatch(setErrorAC(res.data.messages[0]))
                } else {
                    dispatch(setErrorAC('Some error'))
                }
                dispatch(setStatusAC('failed'))
            }

        })
    }
}

export const deleteTaskTC = (taskId: string, todolistId: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setStatusAC('loading'))
        todolistsAPI.deleteTask(todolistId,taskId)
            .then( () => {
                dispatch(removeTaskAC(taskId,todolistId))
                dispatch(setStatusAC('succeeded'))
            })
    }
}

export const updateTaskTC = (todolistId: string, taskId: string, domainModel: UpdateDomainTaskModelType) => {
    return (dispatch: Dispatch, getState: () => AppRootStateType) => {
        dispatch(setStatusAC('loading'))

        const task = getState().tasks[todolistId].find( (t) => t.id === taskId)

        if (task) {
            const model: UpdateTaskModelType = {
                title: task.title,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                deadline: task.deadline,
                status: task.status,
                ...domainModel
            }
            todolistsAPI.updateTask(todolistId, taskId, model)
                .then( () => {
                    dispatch(updateTaskStatusAC(taskId,domainModel,todolistId))
                    dispatch(setStatusAC('succeeded'))
                })
        }
    }
}
