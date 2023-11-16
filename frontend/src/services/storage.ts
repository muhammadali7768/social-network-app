const clearUserData = () => {
    localStorage.removeItem('@authToken');
    localStorage.removeItem('@refreshToken');
    localStorage.removeItem('@userData');
  };
  
  const setAuthData = (token: string, refreshToken: string) => {
    localStorage.setItem('@authToken', token);
    localStorage.setItem('@refreshToken', refreshToken);
  };
  
  const getAuthData = () => {
    const token = localStorage.getItem('@authToken');
    const refreshToken = localStorage.getItem('@refreshToken');
  
    return { token, refreshToken };
  };
  
  const setUserData = (data: any) => {
    if (data?.id) {
      localStorage.setItem('@userData', JSON.stringify(data));
    }
  };
  
  const getUserData = () => {
    const userData = localStorage.getItem('@userData');
    if (userData) {
      const user = JSON.parse(userData);
      return { ...user };
    }
    return {}
  };
  
  const Storage = {
    clearUserData,
    setAuthData,
    getAuthData,
    setUserData,
    getUserData
  };
  
  export default Storage;