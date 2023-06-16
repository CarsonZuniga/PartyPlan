const random_num = (digits) => {return Math.floor(10**(digits-1) + Math.random() * 9 * 10**(digits-1));} // random DIGITS digit integer (non-zero first digit)

export default class AppService {
    constructor() {
        this.apiUrlEndPoint = "http://localhost:4080/";
        this.getMethodCall = {
            method: 'GET',
            headers: { 'Content-type': 'application/json;charset=UTF-8' }
        };
        this.postMethodCall = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' }
        }
        this.deleteMethodCall = {
            method: 'DELETE',
            headers: { 'Content-type': 'application/json;charset=UTF-8' }
        }
        this.patchMethodCall = {
            method: 'PATCH',
            headers: { 'Content-type': 'application/json;charset=UTF-8' }
        }
    }

    async doGetParties(limit, tags) {
        let rawResponse = await fetch(`${this.apiUrlEndPoint}getAllActive/${limit}/${JSON.stringify(tags)}`, this.getMethodCall);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            return new Promise((resolve) => { resolve(jsonReturn) });
        }
        else
            return new Promise((resolve) => { resolve(rawResponse.status) });
    }

    async doSearch(limit, search) {
        if (search === "")
            return this.doGetParties(limit, []);
        let rawResponse = await fetch(`${this.apiUrlEndPoint}searchPartiesUsers/${limit}/${search}`, this.getMethodCall);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            console.log(jsonReturn);
            return new Promise((resolve) => { resolve(jsonReturn) });
        }
        else
            return new Promise((resolve) => { resolve(rawResponse.status) });
    }

    async getAddr(lat, lng) {
        // use Open Street Map to get address from latitute and longitude
        let rawResponse = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${lat},${lng}&polygon_geojson=1&format=json`);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            return new Promise((resolve) => { resolve(jsonReturn[0].display_name) });
        }
        else
            return new Promise((resolve) => { resolve(rawResponse.status) });
    }

    async batchGetAddr(latLngArr) {
        const KEY = "qlfuZg4jCynH0Y6K318UbtAj51AJJImR";

        var locations = "";
        latLngArr.map(latLng => (
            locations += `&location=${latLng[0]},${latLng[1]}`
        ));

        // use mapquest API for bulk addresses
        let rawResponse = await fetch(`http://www.mapquestapi.com/geocoding/v1/batch?key=${KEY}${locations}`);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            var response = [];
            jsonReturn.results.map(obj => (
                response.push([obj.locations[0].street, obj.locations[0].adminArea5, obj.locations[0].adminArea3])
            ))
            return new Promise((resolve) => { resolve(response) });
        }
        else
            return new Promise((resolve) => { resolve(rawResponse.status) });
    }

    async logIn(userID) {
        let rawResponse = await fetch(this.apiUrlEndPoint + 'login/' + userID, this.getMethodCall);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            return new Promise((resolve) => { resolve(jsonReturn) });
        }
        else
            return new Promise((resolve) => { resolve(rawResponse.status) });
    }

    async getRSVPs(userID) {
        let rawResponse = await fetch(this.apiUrlEndPoint + 'getRSVPs/' + userID, this.getMethodCall);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            return new Promise((resolve) => { resolve(jsonReturn) });
        }
        else
            return new Promise((resolve) => { resolve(rawResponse.status) });
    }

    async getUserParties(userID) {
        let rawResponse = await fetch(this.apiUrlEndPoint + 'getUserParties/' + userID, this.getMethodCall);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            return new Promise((resolve) => { resolve(jsonReturn) });
        }
        else
            return new Promise((resolve) => { resolve(rawResponse.status) });
    }

    async deleteParty(partyID) {
        let request = {
            method: 'DELETE',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({
                "partyID": partyID
            })
        }
        let rawResponse = await fetch(this.apiUrlEndPoint + 'deleteParty', request);
        return new Promise((resolve) => { resolve(rawResponse) });
    }

    async createParty(partyArr) {
        let request = {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(partyArr)
        }
        let rawResponse = await fetch(this.apiUrlEndPoint + 'createParty', request);
        return new Promise((resolve) => { resolve(rawResponse) });
    }

    async getPartyID() {
        let rawResponse = await fetch(this.apiUrlEndPoint + 'getPartyID', this.getMethodCall);
        if (rawResponse.ok === true) {
            let jsonReturn = await rawResponse.json();
            while (true) {
                var new_party_id = random_num(6);
                if (!jsonReturn.includes(new_party_id))
                    break;
            }
            return new Promise((resolve) => { resolve(new_party_id) });
        }
        else
            return new Promise((resolve) => { resolve(rawResponse.status) });
    }

    async updateCapacity(partyID, new_capacity) {
        let request = {
            method: 'PATCH',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({
                "partyID": partyID,
                "capacity": new_capacity
            })
        }
        let rawResponse = await fetch(this.apiUrlEndPoint + 'updateCapacity', request);
        return new Promise((resolve) => { resolve(rawResponse) });
    }

    async updateTags(partyID, new_tags) {
        let request = {
            method: 'PATCH',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({
                "partyID": partyID,
                "tags": JSON.stringify(new_tags)
            })
        }
        let rawResponse = await fetch(this.apiUrlEndPoint + 'updateTags', request);
        return new Promise((resolve) => { resolve(rawResponse) });
    }

    async checkExpiring() {
        let rawResponse = await fetch(this.apiUrlEndPoint + 'checkExpiring', this.getMethodCall);
        return new Promise((resolve) => { resolve(rawResponse) });
    }

}