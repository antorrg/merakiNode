export default {
 decodeJwt,

 isTokenValid : (token:string) => {
    const data = decodeJwt(token);
    if (!data?.exp) return false;
    return data.exp > Math.floor(Date.now() / 1000);
  },

 getTokenExpireInMs : (token:string) => {
    const data = decodeJwt(token);
    if (!data?.exp) return 0;
    return (data.exp * 1000) - Date.now();
  },
}
function decodeJwt(token:string) {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }