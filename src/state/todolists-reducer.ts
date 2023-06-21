import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {RequestStatusType, setStatusAC, SetStatusActionType} from "./app-reducer";

export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export type ChangeTodolistTitleActionType = ReturnType<typeof changeTodolistTitleAC>
export type ChangeTodolistFilterActionType = ReturnType<typeof changeTodolistFilterAC>
export type SetTodoListACType = ReturnType<typeof setTodoListAC>
export type SetEntityStatusType = ReturnType<typeof setEntityStatusAC>

type ActionsType = RemoveTodolistActionType | AddTodolistActionType
    | ChangeTodolistTitleActionType
    | ChangeTodolistFilterActionType
    | SetTodoListACType
    | SetStatusActionType
    | SetEntityStatusType

const initialState: Array<TodolistDomainType> = [
    /*{id: todolistId1, title: 'What to learn', filter: 'all', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', addedDate: '', order: 0}*/
]

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType,
    entityStatus: RequestStatusType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'REMOVE-TODOLIST':
            return state.filter(tl => tl.id !== action.todolistId)
        case 'ADD-TODOLIST':
            return [{...action.todoList, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map( (tl) => tl.id === action.todolistId ? {...tl, title: action.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':
            return state.map( (tl) => tl.id === action.todolistId ? {...tl, filter: action.filter} : tl)
        case "SET-TODOLIST":
            return action.todoList.map((tl) => ({...tl, filter: 'all', entityStatus: 'idle'}))
        case "SET-ENTITY-STATUS":
            return state.map((tl) => tl.id === action.todolistId ? {...tl, entityStatus: action.entityStatus}: tl)
        default:
            return state;
    }
}

export const removeTodolistAC = (todolistId: string) => {
    return {
        type: 'REMOVE-TODOLIST',
        todolistId,
    } as const
}
export const addTodolistAC = (todoList: TodolistType) => {
    return {
        type: 'ADD-TODOLIST',
        todoList
    } as const
}
export const changeTodolistTitleAC = (todolistId: string, title: string) => {
    return {
        type: 'CHANGE-TODOLIST-TITLE',
        todolistId,
        title
    } as const
}
export const changeTodolistFilterAC = (todolistId: string, filter: FilterValuesType) => {
    return {
        type: 'CHANGE-TODOLIST-FILTER',
        todolistId,
        filter
    } as const
}
export const setTodoListAC = (todoList: TodolistType[]) => {
    return {
        type: 'SET-TODOLIST',
        todoList
    } as const
}
export const setEntityStatusAC = ( todolistId: string, entityStatus: RequestStatusType) => {
    return {
        type: 'SET-ENTITY-STATUS',
        todolistId,
        entityStatus
    } as const
}
//---------------------THUNK----------------------------------
export const getTodoListTC = () => {
    return (dispatch: Dispatch) => {
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodoListAC(res.data))
                dispatch(setStatusAC('succeeded'))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setStatusAC('loading'))
        todolistsAPI.createTodolist(title)
            .then( (res) => {
                dispatch(addTodolistAC(res.data.data.item))
                dispatch(setStatusAC('succeeded'))
            })
    }
}
export const deleteTodoListTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setStatusAC('loading'))
        dispatch(setEntityStatusAC(todolistId, 'loading'))
        todolistsAPI.deleteTodolist(todolistId)
            .then( () => {
                dispatch(removeTodolistAC(todolistId))
                dispatch(setStatusAC('succeeded'))
            })
            .catch( () => {
                dispatch(setEntityStatusAC(todolistId, 'idle'))
            })
    }
}
export const updateTodoListTC = (todoListId: string, title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setStatusAC('loading'))
        todolistsAPI.updateTodolist(todoListId, title)
            .then( () => {
                dispatch(changeTodolistTitleAC(todoListId, title))
                dispatch(setStatusAC('succeeded'))
            })
    }
}

