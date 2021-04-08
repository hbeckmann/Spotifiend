import React, { useState } from 'react';

function TermButtons(props) {

    let settings;
    if (props.settings === undefined) {
        settings = {};
    } else {
        settings = props.settings;
    }

    const [activeArr, setActiveArr] = useState(
        [
            {
                name: 'Short Term',
                term: 'short_term',
                status: ''
            },
            {
                name: 'Mid Term',
                term: 'medium_term',
                status: 'active'
            },
            {
                name: 'Long Term',
                term: 'long_term',
                status: ''
            }
        ]
    );

    let activateTerm = (index) => {
        let updatedArr = [];
        for (let i in activeArr) {
            updatedArr.push({});
            updatedArr[i].name = activeArr[i].name;
            updatedArr[i].term = activeArr[i].term;
            if (Number(i) === Number(index)) {
                updatedArr[i].status = "active";
            } else {
                updatedArr[i].status = "";
            }
        }
        setActiveArr(updatedArr);
    }

    return (
        <div className="termButtons">
            {activeArr.map((item, index) => (
                <TermButton key={item.name} name={item.name} status={item.status} onClick={() => {
                    activateTerm(index);
                    props.setLoadingProgress(80);
                    props.getMusicInfo(props.type, item.term, props.accessToken, settings)
                }} />
            ))}
        </div>
    )

}

function TermButton(props) {

    return (
        <button onClick={props.onClick}><h4 className={props.status} >{props.name}</h4></button>
    )

}

export default TermButtons;