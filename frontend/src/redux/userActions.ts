export const setUserToken = (token: string) => {
    return {
      type: 'SET_USER_TOKEN',
      payload: token,
    };
  };
  
  export const setUserData = (data: any) => {
    return {
      type: 'SET_USER_DATA',
      payload: data,
    };
  };
  