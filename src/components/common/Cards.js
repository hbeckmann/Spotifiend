import React from 'react';

export function CardList(props) {

    const cardList = props.cardList;

    return (
        <>
            {cardList.map((item) => (
                <Card key={item.name + item.track_number} cardInfo={item} accessToken={props.accessToken} trackList={props.trackList} />
            ))}
            { props.recommended ? <FindMoreCard getArtistRecommendations={props.getArtistRecommendations} /> : ""}
        </>
    )

}

export function Card(props) {

    const cardInfo = props.cardInfo;
    let imgSrc;
    let detailsText = "";

    if (props.trackList) {
        imgSrc = cardInfo.album.images[0].url;
        detailsText = cardInfo.artists[0].name;
    } else {
        imgSrc = cardInfo.images[0].url;
    }

    return (
        <a href={cardInfo.external_urls.spotify} rel="noreferrer noopener" target="_blank">
            <div className="card">
                <div className="cardImgContainer">
                    <img src={imgSrc} alt={cardInfo.name} className="cardImg" />
                </div>
                <div className="cardText">
                    <h3>{cardInfo.name}</h3>
                    <h4>{detailsText}</h4>
                </div>
            </div>
        </a>
    )

}

export function FindMoreCard(props) {

    return (
        <div className="card" onClick={() => props.getArtistRecommendations()}>
            <div className="cardImgContainer">
                <img src="./images/add2.png" alt="Find more songs" className="cardImg" />
            </div>
            <div className="cardText">
                <h3>Find More Songs</h3>
            </div>
        </div>
    )

}