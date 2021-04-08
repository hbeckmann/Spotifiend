import React, { useContext } from 'react';
import LoadingBar from 'react-top-loading-bar';
import CookieConsent from 'react-cookie-consent';
import { ToastContainer } from 'react-toastify';
import './App.css';
import Header from './common/Header';
import 'react-toastify/dist/ReactToastify.css';
import { DashboardContext } from '../context/DashboardContext';

function App() {

    const { mainContent, userProfile, tokenActive, setLoadingProgress, loadingProgress, onLoaderFinished } = useContext(DashboardContext);

    return (
        <div className="App">
            <Header userProfile={userProfile} tokenActive={tokenActive} setLoadingProgress={setLoadingProgress} />
            <ToastContainer
                position="top-right"
                autoClose={8000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {mainContent}
            <CookieConsent
                style={{ background: "black" }}
                buttonStyle={{ background: "#1DB954", color: "white" }}
            >
                This website uses cookies to enhance the user experience -- by using this site you agree to the
                {' '}
                <a rel="noreferrer noopener" target="_blank" style={{ color: "#1DB954", cursor: "pointer" }} href="https://www.cookiepolicygenerator.com/live.php?token=V3aCHeOj993Dumoh2ERu4aBnoN07eBB4">
                    cookie policy.
                </a>
            </CookieConsent>
            <div className="loadingHolder">
                <LoadingBar
                    className="test"
                    progress={loadingProgress}
                    height={10}
                    color='#1db954'
                    onLoaderFinished={() => onLoaderFinished()}
                />
            </div>
        </div>
    );
}

export default App;
