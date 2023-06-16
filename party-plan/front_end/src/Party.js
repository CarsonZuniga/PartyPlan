import React from 'react';
import {Container, Row, Col} from "react-bootstrap/";
import AppService from './AppService';

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

class Party extends React.Component {
    constructor(props) {
        super(props);
        this.human_start = new Date(this.props.partyObj.start_time);
        this.human_end = new Date(this.props.partyObj.end_time);
        this.state = {
            remaining_time: ''
        }
        this.appService = new AppService(); 
    }

    componentDidMount = () => {
        setInterval(this.getRemainingTime, 1000);
    }

    getRemainingTime = () => {
        let now = new Date().getTime();
        let distance = this.human_end.getTime() - now;
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        this.setState({remaining_time: `${days.pad()}D:${hours.pad()}H:${minutes.pad()}M:${seconds.pad()}S`});
    }

    render() {
        return (
            <Container className="Party-Widget">
                <Row>
                    <Col>
                        <br/>{this.props.partyObj.address ? `${this.props.partyObj.address[0]}, ${this.props.partyObj.address[1]}, ${this.props.partyObj.address[2]}` : ''}
                        <br/>{this.human_start.toGMTString()}
                        <br/>{this.human_end.toGMTString()}
                        <br/>{this.props.partyObj.tags.sort().join(", ")}
                        <br/>Remaining Time: {this.state.remaining_time}
                    </Col>
                    <Col>
                        <br/>{this.props.partyObj.first} {this.props.partyObj.last}
                        <br/>Avg. User Safety Rating: {parseFloat(this.props.partyObj.safety).toFixed(1)}
                        <br/>Avg. User Enjoyability Rating: {parseFloat(this.props.partyObj.fun).toFixed(1)}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Party {this.props.partyObj.partyID}
                    </Col>
                </Row>   
            </Container>
        );
    }
}

export default Party;