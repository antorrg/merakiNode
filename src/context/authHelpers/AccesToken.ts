
export interface IAccessToken {
    get: () => string | null | undefined;
    setToken: (accessToken: string) => void;
    clear: () => void;
}
class AccessToken implements IAccessToken {
    
    constructor(){}

    #token?: string | null | undefined = null

    get = () => {
        return this.#token
    }

    setToken = (accessToken:string) =>{
        //console.log('soy eltoken', accessToken)
        if (typeof accessToken !== "string") {
        throw new Error("AccessToken must be a string");
            }
        this.#token = accessToken
    }
    
    clear = () => {
    this.#token = null;
    }
}
export const accessToken = new AccessToken()