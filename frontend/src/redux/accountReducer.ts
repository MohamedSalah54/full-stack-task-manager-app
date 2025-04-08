interface State {
    token: string | null;
    user: any;
  }
  
  const initialState: State = {
    token: null,
    user: null,
  };
  
  const accountReducer = (state = initialState, action: any): State => {
    switch (action.type) {
      case 'SET_USER_TOKEN':
        return {
          ...state,
          token: action.payload,
        };
      case 'SET_USER_DATA':
        return {
          ...state,
          user: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default accountReducer;
  