import React from 'react';

function Header(props) {

  const profile = props.userProfile;
  const isLoggedIn = (profile.display_name !== undefined);
  let profilePic;
  if (profile.images && profile.images.length > 0 ) {
    profilePic = profile.images[0].url;
  } else {
    profilePic = "./images/default_avatar.png";
  }

  let profileBar;

  if (isLoggedIn && props.tokenActive) {
    profileBar =  (
      <a href={profile.external_urls.spotify} rel="noreferrer noopener" target="_blank" className="profileBar">
        <img className="profilePic" src={profilePic} alt="Profile" />
        {profile.display_name}
      </a>
    )
  } else {
    let location = `https://accounts.spotify.com/authorize?client_id=bb789d3b0efb474c821885182e1140f8&redirect_uri=${window.location.origin}/&scope=user-read-private%20user-read-email%20playlist-modify-public%20user-top-read&response_type=token`;
    profileBar = (
      <div className="logInButton">
        <a href={location} onClick={() => props.setLoadingProgress(90)}>
          <button className="spotButton">LOG IN TO SPOTIFY</button>
        </a>
      </div>
    )
  }

  return (
    <header>
      <ul>
        <li><img src={"./images/full_spotifiend_logo.png"} className="logo" alt="logo" /></li>
      </ul>
      {profileBar}
    </header>
  )
}

export default Header;
