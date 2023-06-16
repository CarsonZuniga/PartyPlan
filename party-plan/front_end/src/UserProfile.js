import React from 'react';
import AppService from './AppService';
import {Row, Button, Popover, OverlayTrigger, Form, InputGroup} from "react-bootstrap/";
import { components } from "react-select";
import { default as ReactSelect } from "react-select";
import DateTimePicker from 'react-datetime-picker';

const dateTime = (date) => {console.log(date); console.log(date.toISOString().slice(0, 19).replace('T', ' ')); return date.toISOString().slice(0, 19).replace('T', ' ')};

/*

SELECT DISTINCT userID FROM RSVP r WHERE (SELECT COUNT(*) FROM RSVP WHERE userID = r.userID) > 1 AND EXISTS (SELECT * FROM ActiveParty WHERE userID = r.userID) ORDER BY userID LIMIT 10;

*/

const Option = (props) => {
    return (
      <div>
        <components.Option {...props}>
          <input
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
          />{" "}
          <label>{props.label}</label>
        </components.Option>
      </div>
    );
};

const TAGS = ["Open House", "BYOB", "Costume", "Chill", "Greek", "RSO"].sort();

class UserProfile extends React.Component {
    constructor(props) {
        super(props);
        this.appService = new AppService();
        this.state = {
            RSVPs: [],
            parties: [],
            latitude: '',
            longitude: '',
            new_party_id: '',
            optionSelected: [],
            selected_tags_arr: [],
            capacity: '',
            updated_capacity: {},
            updated_tags: {},
            start_time: new Date(),
            end_time: new Date()
        }
    }

    componentDidMount() {
        this.getRSVPs();
    }

    getRSVPs = () => {
        this.appService.getRSVPs(this.props.user_profile.userID).then(res => {
            this.setState({RSVPs: res}, this.getParties);
        });
    }

    getParties = () => {
        this.appService.getUserParties(this.props.user_profile.userID).then(res => {
            this.setState({parties: res});
        })
    }

    deleteParty = (partyID) => {
        this.appService.deleteParty(partyID).then(res => {
            if (res.ok)
                alert(`Successfully deleted party ${partyID}`);
            else
                alert(`Could not delete party ${partyID}`);
            this.getRSVPs();
        });
    }

    getLatLng = () => {
        if (this.state.latitude === '' || this.state.longitude === '')
            navigator.geolocation.getCurrentPosition((position) => {this.setState({latitude: position.coords.latitude, longitude: position.coords.longitude})});
    }

    getPartyID = () => {
        if (this.state.latitude === '' || this.state.longitude === '' || this.state.capacity === '') {
            alert('Please fill all fields and/or allow geolocation.');
            return;
        }
        this.appService.getPartyID().then(res => {
            this.setState({new_party_id: res}, this.postParty);
        });
    }

    postParty = () => {
        let partyArr = [
                this.state.new_party_id, this.props.user_profile.userID,
                this.state.latitude, this.state.longitude,
                JSON.stringify(this.state.selected_tags_arr), this.state.capacity,
                dateTime(this.state.start_time), dateTime(this.state.end_time)
        ];
        /*
        partyID INT UNSIGNED NOT NULL PRIMARY KEY,
        userID INT UNSIGNED NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        tags JSON,
        capacity INT NOT NULL,
        start_time DATE NOT NULL,
        end_time DATE NOT NULL,
        */
        this.appService.createParty(partyArr).then(res => {
            if (res.ok)
                alert(`Successfully created party`);
            else
                alert(`Could not create party`);
            this.getRSVPs();
        });
    }

    createParty = () => {
        this.getLatLng();
    }

    updateCapacity = (partyID, new_capacity) => {
        if (new_capacity) {
            this.appService.updateCapacity(partyID, new_capacity).then(res => {
                if (res.ok)
                    alert(`Successfully updated party capacity`);
                else
                    alert(`Could not update party capacity`);
            })
        }
    }

    updateTags = (partyID, new_tags) => {
        if (new_tags) {
            this.appService.updateTags(partyID, new_tags).then(res => {
                if (res.ok)
                    alert(`Successfully updated party tags`);
                else
                    alert(`Could not update party tags`);
            })
        }
    }

    render() {
        return (
            <>
            <Row>
                <OverlayTrigger trigger="click" placement="bottom"
                    overlay={
                        <Popover id="popover-positioned-bottom" style={{ maxWidth: 500 }}>
                        <Popover.Header as="h3">{this.props.user_profile.userID}</Popover.Header>
                            <Popover.Body>
                                <ul>
                                    <li>Name: {this.props.user_profile.first_name} {this.props.user_profile.last_name}</li>
                                    <li>Phone Number: {this.props.user_profile.phone_number}</li>
                                    <li>Email: {this.props.user_profile.email}</li>
                                    <li>
                                        Your RSVPs:
                                        <ul>
                                            {
                                                this.state.RSVPs.map(RSVP => (
                                                    <li key={RSVP.partyID}>PartyID: {RSVP.partyID},  Response: {RSVP.reponse}</li>
                                                ))
                                            }
                                        </ul>
                                    </li>
                                    <li>
                                        Your Parties:
                                        <ul>
                                            {
                                                this.state.parties.map(party => (
                                                    <li key={party.partyID}>
                                                        PartyID: {party.partyID}
                                                        <ul>
                                                            <li className="popover-map-li">
                                                                <Button variant="outline-danger" onClick={() => {this.deleteParty(party.partyID)}}>Delete</Button>
                                                            </li>
                                                            <li className="popover-map-li">
                                                                <InputGroup className="mb-3">
                                                                    <Button variant="primary" onClick={() => {this.updateCapacity(party.partyID, this.state.updated_capacity[party.partyID])}}>
                                                                        Update Capacity
                                                                    </Button>
                                                                    <Form.Control
                                                                        placeholder="Enter New Capacity"
                                                                        onChange={(e) => {this.setState(prevState => ({
                                                                            updated_capacity: {
                                                                                ...prevState.updated_capacity,
                                                                                [party.partyID]: e.target.value
                                                                            }
                                                                        }))}}
                                                                    />
                                                                </InputGroup>
                                                            </li>
                                                            <li className="popover-map-li">
                                                                <Button variant="primary" onClick={() => {this.updateTags(party.partyID, this.state.updated_tags[party.partyID].selected_tags_arr)}}>
                                                                    Update Tags
                                                                </Button>
                                                                <span
                                                                className="d-inline-block"
                                                                data-toggle="popover"
                                                                data-trigger="focus"
                                                                data-content="Please select tag(s)"
                                                                >
                                                                <ReactSelect
                                                                    options={TAGS.map(tag => ({value: tag, label: tag}))}
                                                                    isMulti
                                                                    closeMenuOnSelect={false}
                                                                    hideSelectedOptions={false}
                                                                    components={{
                                                                        Option
                                                                    }}
                                                                    onChange={(selected) => this.setState(prevState => ({
                                                                        updated_tags: {
                                                                            ...prevState.updated_tags,
                                                                            [party.partyID]: {
                                                                                ...prevState.updated_tags[party.partyID],
                                                                                optionSelected: selected,
                                                                                selected_tags_arr: selected.map(obj => obj.value)
                                                                            }
                                                                        }
                                                                    }))}
                                                                    allowSelectAll={true}
                                                                    placeholder='Select tags...'
                                                                    value={this.state.updated_tags[party.partyID] ? this.state.updated_tags[party.partyID].optionSelected : []}
                                                                />
                                                                </span>
                                                            </li>
                                                        </ul>
                                                        
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </li>
                                </ul>
                            </Popover.Body>
                        </Popover>
                    }>
                    <Button variant="primary">Show User Profile</Button>
                </OverlayTrigger>
            </Row>
            <Row>
                <OverlayTrigger trigger="click" placement="bottom"
                    overlay={
                        <Popover id="popover-positioned-bottom" style={{ maxWidth: 500 }}>
                        <Popover.Header as="h3">Create A Party</Popover.Header>
                            <Popover.Body>
                                <ul>
                                    <li className="popover-map-li">
                                        <span
                                        className="d-inline-block"
                                        data-toggle="popover"
                                        data-trigger="focus"
                                        data-content="Please select tag(s)"
                                        >
                                        <ReactSelect
                                            options={TAGS.map(tag => ({value: tag, label: tag}))}
                                            isMulti
                                            closeMenuOnSelect={false}
                                            hideSelectedOptions={false}
                                            components={{
                                                Option
                                            }}
                                            onChange={(selected) => this.setState({
                                                optionSelected: selected, selected_tags_arr: selected.map(obj => obj.value)
                                            })}
                                            allowSelectAll={true}
                                            placeholder='Select tags...'
                                            value={this.state.optionSelected}
                                        />
                                        </span>
                                    </li>
                                    <li className="popover-map-li">
                                        <Form.Control
                                            placeholder="Enter Capacity"
                                            onChange={(e) => {this.setState({capacity: e.target.value})}}
                                        />
                                    </li>
                                    <li className="popover-map-li">
                                        <DateTimePicker onChange={(value) => {this.setState({start_time: value})}} value={this.state.start_time}/>
                                    </li>
                                    <li className="popover-map-li">
                                        <DateTimePicker onChange={(value) => {this.setState({end_time: value})}} value={this.state.end_time}/>
                                    </li>
                                    <li className="popover-map-li">
                                        <Button variant="primary" onClick={this.getPartyID}> Post Party! </Button>
                                    </li>
                                </ul>
                            </Popover.Body>
                        </Popover>
                    }>
                    <Button variant="primary" onClick={this.getLatLng}> Throw A Party! </Button>
                </OverlayTrigger>
            </Row>
            </>
        );
    }
}

export default UserProfile;