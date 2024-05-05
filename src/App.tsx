import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { Toaster } from "react-hot-toast";
import Layout from './pages/Layout';
import NotFound from './pages/NotFound';
import About from './pages/About';
import GetStarted from "./pages/GetStarted";
import SignIn from "./pages/SignIn";
import SignInWithEmail from "./pages/SignInWithEmail";
import SignUpWithEmail from "./pages/SignUpWithEmail";
import { User } from "./types/definitions";
import { GlobalContext } from "./context";

function App() {
    let API_URL='https://townhouse-server.onrender.com'
    let search:any=useSearchParams()
    let accessTokenQuery:string=search[0].access_token

  const [user,setUser]=useState<User>({
    photo:"",
    email:"",
    username:"",
    phoneNumber:0,
    emailVerified:false
  })
  const [isLoading,setIsLoading]=useState(true)
  const [isAuth,setIsAuth]=useState(false);

  let $userData:any=localStorage.getItem('user_data')
  let parsedUserData:User=JSON.parse($userData)
  async function authenticate(){
    try{
        let url=accessTokenQuery.length===0&&$userData.length>0?`${API_URL}/api/users/${parsedUserData.email}`:`${API_URL}/api/authenticate/${accessTokenQuery}`
        let response=await fetch(url,{
            method:"GET",
            headers:{
                authorization:accessTokenQuery.length===0&&$userData.length>0?`Bearer ${parsedUserData.accessToken}`:""
            }
        })
        let parseRes=await response.json()
        if(parseRes.error){
            console.log(parseRes.error)
            setIsAuth(false)
            setIsLoading(false)
        }else{
            let user:any=parseRes.data;
            let userData:User={
                photo:user.photo,
                email:user.email,
                username:user.username,
                accessToken:user.access_token,
                phoneNumber:user.phone_number,
                emailVerified:user.email_verified
            }
            localStorage.setItem('user_data',JSON.stringify(userData))
            setUser(userData)
            setIsAuth(true)
            setIsLoading(false)
        }
    }catch(error:any){
        console.log(error.message,"fail to authenticate access token")
	    setIsAuth(false)
        setIsLoading(false)
    }
  }

  useEffect(()=>{
      authenticate()
  },[isAuth]);

  return (
    <BrowserRouter>
      <GlobalContext.Provider value={user}>
        {isLoading?(
          <div className="fixed top-0 bottom-0 left-0 z-20 right-0 bg-white">
            <div className="flex flex-col items-center h-[100vh] justify-center">
              <p className="text-xl font-semibold text-[var(--primary-01)]">Loading...</p>
            </div>
          </div>
        ):(
          <>
            <ToastContainer 
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Toaster/>
            <Routes>
              <Route path="/getstarted" element={!isAuth?<GetStarted/>:<Navigate to="/"/>}/>
              <Route path="/sign_in" element={!isAuth?<SignIn />:<Navigate to="/"/>} />
              <Route path="/sign_in_with_email" element={!isAuth?<SignInWithEmail />:<Navigate to="/"/>} />

              <Route path="/sign_up_with_email" element={!isAuth?<SignUpWithEmail />:<Navigate to="/"/>} />
              <Route path="/" element={isAuth?<Layout />:<Navigate to="/getstarted"/>}>
                <Route index element={<About />} />
                {/*<Route path="chat_room" element={<ChatRoom />} />*/}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        )}
      </GlobalContext.Provider>
    </BrowserRouter>
  )
}

export default App
