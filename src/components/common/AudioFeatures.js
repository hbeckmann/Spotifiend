import React from 'react';

export function AudioFeatureList(props) {

    let sortedTracks = props.topTracks.slice().sort((a, b) => b.audio_features[props.feature] - a.audio_features[props.feature]).slice(0, 6);

    return (
        <div className="audioFeatureList">
            <h1>{props.title}</h1>
            {sortedTracks.map((item) => (
                <AudioFeatureRow key={item.name + " feature " + item.id} item={item} feature={props.feature} />
            ))}
        </div>
    )

}

export function AudioFeatureRow({ item, feature }) {

    return (
        <a href={item.external_urls.spotify} rel="noreferrer noopener" target="_blank">
            <div className="audioFeatureRow">
                <div className="featureLeft">
                    <div key={item.name + item.track_number + "feature"} className="imgContainer">
                        <img src={item.album.images[1].url} alt={item.name} />
                    </div>
                    <div className="featureTitle">
                        <h3>{item.name}</h3>
                        <h4>{item.artists[0].name}</h4>
                    </div>
                </div>
                <div className="featureValue">
                    {feature === "loudness" ? <h2>{item.audio_features[feature] + " dB"}</h2> : <h2>{item.audio_features[feature]}</h2>}
                </div>
            </div>
        </a>
    )
}