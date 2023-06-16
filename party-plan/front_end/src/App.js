import React from 'react';
import {Container, Row, Col, Button, InputGroup, Form} from "react-bootstrap/";
import { components } from "react-select";
import { default as ReactSelect } from "react-select";
import Party from './Party';
import AppService from './AppService';
import UserProfile from './UserProfile';

function divide_arr(arr, group_size) {
    var result = [];
    // divides arr into groups of group_size
    for (var i = 0; i < arr.length; i += group_size)
        result.push(arr.slice(i, i + group_size));
    return result;
}

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

class App extends React.Component {
    constructor(props) {
        super(props);
        this.appService = new AppService();
        this.state = {
            parties: [],
            three_parties: [],
            user_profile: {},
            logged_in: false,
            userID: "",
            optionSelected: [],
            selected_tags_arr: [],
            search_query: ""
        };
    }

    // componentDidMount is a function that runs whenever the page loads
    componentDidMount() {
        this.getParties();
    }

    getParties = () => {
        this.appService.doGetParties(27, this.state.selected_tags_arr).then(res => {       
            this.setState({parties: res, three_parties: divide_arr(res, 3)}, this.bulkGetAddr);
        });
    }

    doSearch = () => {
        this.appService.doSearch(27, this.state.search_query).then(res => {       
            this.setState({parties: res, three_parties: divide_arr(res, 3)}, this.bulkGetAddr);
        });
    }

    bulkGetAddr = () => {
        let latLngArr = [];
        this.state.parties.map(party => (
            latLngArr.push([party.latitude, party.longitude])
        ));
        this.appService.batchGetAddr(latLngArr).then(res => {
            var temp = this.state.parties;
            for (var i = 0; i < res.length; i++) {
                temp[i].address = res[i];
            }
            this.setState({parties: temp, three_parties: divide_arr(temp, 3)});
        });
    }

    handleLogin = () => {
        this.appService.logIn(this.state.userID).then(res => {
            if (res && res.length > 0) {
                let obj = res[0];
                this.setState({logged_in: true, user_profile: {
                    userID: obj.userID, first_name: obj.first, last_name: obj.last, phone_number: obj.phone_number, email: obj.email
                }});
            }
        });
    }

    checkExpiring = () => {
        this.appService.checkExpiring().then(res => {     
            if (res.ok)  
                alert("Successfully checked expiring");
            else
                alert("Error checking expiring");
            this.getParties();
        });

    }

    render() {
        const renderParties = () => {
            // renders a single container containing rows which contain up to three cols
            return (
                <Container className="Party-List">
                    {
                        this.state.three_parties.map(party_row => (
                            <Row key={party_row[0].partyID}>
                                <Col md="4">{party_row.length > 0 ? <Party partyObj={party_row[0]}/> : <></>}</Col>
                                <Col md="4">{party_row.length > 1 ? <Party partyObj={party_row[1]}/> : <></>}</Col>
                                <Col md="4">{party_row.length > 2 ? <Party partyObj={party_row[2]}/> : <></>}</Col>
                            </Row>
                        ))
                    }
                </Container>
            );
        }

        const renderLogin = () => {
            return (
                <>
                {
                this.state.logged_in ? 
                    <UserProfile user_profile={this.state.user_profile}/>
                    :
                    <Row>
                        <InputGroup className="mb-3">
                            <Button variant="primary" onClick={this.handleLogin}>
                                Log In
                            </Button>
                            <Form.Control
                                placeholder="Enter UserID"
                                onChange={(e) => {this.setState({userID: e.target.value})}}
                            />
                        </InputGroup>
                    </Row>
                }
                </>
            );
        }
        
        return (
            <Container>
                <Row>
                    <Col>
                    <Row>
                        <Col>
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
                                    }, this.getParties)}
                                    allowSelectAll={true}
                                    placeholder='Select tags...'
                                    value={this.state.optionSelected}
                                />
                            </span>
                        </Col>    
                    </Row>
                    <Row>
                        <InputGroup className="mb-3">
                            <Button variant="primary" onClick={this.doSearch}>
                                Search
                            </Button>
                            <Form.Control
                                placeholder="Enter Search Query"
                                onChange={(e) => {this.setState({search_query: e.target.value})}}
                            />
                        </InputGroup>
                    </Row>
                    </Col>
                    <Col>
                        <Button onClick={this.checkExpiring}>Check Expiring</Button>
                        <br/>PartyPlan
                        <br/>Find Parties
                    </Col>
                    <Col>
                        {renderLogin()}
                    </Col>
                </Row>
                <Row>
                    {renderParties()}
                </Row>
            </Container>
        );
    }
}

export default App;
