import React, {useState} from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import './App.css';
import './css/mvp.css';
import Home from './pages/Home';
import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import Users from './pages/user/Users';
import LoginUser from "./pages/user/LoginUser";
import RegisterUser from "./pages/user/RegisterUser";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword"; // <--- Import
import Secrets from "./pages/secret/Secrets";
import NewCredential from "./pages/secret/NewCredential";
import NewCreditCard from "./pages/secret/NewCreditCard";
import NewNote from "./pages/secret/NewNote";
import LoginSuccess from './pages/user/LoginSuccess';

function App() {
    const [loginValues, setLoginValues] = useState({
        email: "",
        password: "",
    });

    return (
        <GoogleReCaptchaProvider reCaptchaKey="6LdUBx8sAAAAAJdxEk-XiQLZbuzJt-4h81GnTfnt">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout loginValues={loginValues}/>}>
                        <Route index element={<Home/>}/>
                        <Route path="/user/success" element={<LoginSuccess />} />
                        <Route path="/user/users" element={<Users loginValues={loginValues}/>}/>
                        <Route path="/user/login" element={<LoginUser loginValues={loginValues} setLoginValues={setLoginValues}/>}/>
                        <Route path="/user/register" element={<RegisterUser loginValues={loginValues} setLoginValues={setLoginValues}/>}/>

                        {/* New Routes */}
                        <Route path="/user/forgot-password" element={<ForgotPassword />}/>
                        <Route path="/user/reset-password" element={<ResetPassword />}/>

                        <Route path="/secret/secrets" element={<Secrets loginValues={loginValues}/>}/>
                        <Route path="/secret/newcredential" element={<NewCredential loginValues={loginValues}/>}/>
                        <Route path="/secret/newcreditcard" element={<NewCreditCard loginValues={loginValues}/>}/>
                        <Route path="/secret/newnote" element={<NewNote loginValues={loginValues}/>}/>
                        <Route path="*" element={<NoPage/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </GoogleReCaptchaProvider>
    )
}

export default App;