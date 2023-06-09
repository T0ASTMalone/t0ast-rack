import React, { createContext, useContext, useReducer } from 'react';
import { Actions, RackAction, RackState } from '../types/RackContextTypes';
import { RackDestinationNode } from '../types/RackTypes';
import { createInput, createOutput, removeInput, removeModule, removeOutput } from './RackContextReducers';

const RackStateContext = createContext<RackState | undefined>(undefined);
const RackDispatchContext = createContext<React.Dispatch<RackAction> | undefined>(undefined);

const defaultRackState: RackState = {
  context: undefined,
  destination: undefined,
  patches: {}, 
  modules: [],
  input: '',
  output: '',
};


const rackReducer = (state: RackState, action: RackAction): RackState => {
  if (!action) {
    return state;
  }

  switch (action.actionType) {
    case Actions.AddModule:
      return { ...state, modules: [...state.modules, action.message.module] };
    case Actions.RemoveModule:
      // TODO: remove any patches with this module
      // TODO: disconnect from AudioContext if connected
      // remove input / output if part of this module
      if (!state.modules.some((mod) => mod.id === action.message.moduleId)) {
        return state;
      }
      /*
      return {
        ...state,
        modules: [...state.modules.filter((mod) => mod.id !== action.message.moduleId)],
      };
      */
      return {...removeModule(state, action.message.moduleId)};
    case Actions.AddOutput:
      return {...createOutput(action.message.outputId, state, action.message.param)}
    case Actions.AddInput:
      return {...createInput(action.message.inputId, state, action.message.param)}
    case Actions.RemoveOutput: 
      return {...removeOutput(action.message.outputId, state, action.message.connectionId, action.message.param)}
    case Actions.RemoveInput: 
      return {...removeInput(action.message.inputId, state, action.message.connectionId, action.message.param)}
    case Actions.Init: 
      const context = new AudioContext();
      const destination = new RackDestinationNode(context);
      destination.init();
      return { ...state, context, destination } 
    default:
      break;
  }
  return state;
};

function RackProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rackReducer, defaultRackState);

  return (
    <RackStateContext.Provider value={state}>
      <RackDispatchContext.Provider value={dispatch}>
        {children}
      </RackDispatchContext.Provider>
    </RackStateContext.Provider>
  );
}

const useRackState = () => {
  const context = useContext(RackStateContext);
  if (context === undefined) {
    throw new Error('[useRackState] context is undefined');
  }
  return context;
};

const useRackDispatch = () => {
  const context = useContext(RackDispatchContext);
  if (context === undefined) {
    throw new Error('[useRackState] context is undefined');
  }
  return context;
};

export { RackProvider, useRackState, useRackDispatch };
