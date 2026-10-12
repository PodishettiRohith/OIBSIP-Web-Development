import React,{createContext,useContext,useEffect,useState} from 'react';
export const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{try{const u=localStorage.getItem('pizzaApp_user');const t=localStorage.getItem('pizzaApp_token');if(u&&t)setUser(JSON.parse(u));}catch{}finally{setLoading(false)}},[]);
 const login=(data)=>{const u={name:data.name,email:data.email,role:data.role};setUser(u);localStorage.setItem('pizzaApp_user',JSON.stringify(u));localStorage.setItem('pizzaApp_token',data.token)};
 const logout=()=>{setUser(null);localStorage.removeItem('pizzaApp_user');localStorage.removeItem('pizzaApp_token');};
 return <AuthContext.Provider value={{user,login,logout,loading}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
