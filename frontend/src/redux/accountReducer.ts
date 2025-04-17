interface State {
  token: string | null;
  user: {
    id: string | null;
    name: string | null;
    // أي خصائص أخرى متعلقة بالمستخدم
  } | null;
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
      console.log("User data being set in Reduxسسس:", action.payload);  // سجل البيانات التي تم إرسالها
      return {
        ...state,
        user: action.payload,  // تأكد من أن الـ payload يحتوي على id
      };
    default:
      return state;
  }
};


export default accountReducer;
