export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'loading' as RequestStatusType,
    error: null as null | string
}
type InitialStateType = typeof initialState

export type SetStatusActionType = ReturnType<typeof setStatusAC>
export type SetErrorActionType = ReturnType<typeof setErrorAC>

type ActionsType = SetStatusActionType | SetErrorActionType

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'SET-STATUS' :
            return {...state, status: action.status}
        case 'SET-ERROR' :
            return {...state, error: action.error}
        default:
            return state
    }
}

export const setStatusAC = (status: RequestStatusType) => ({type: 'SET-STATUS', status} as const)
export const setErrorAC = (error: null | string) => ({type: 'SET-ERROR', error} as const)

