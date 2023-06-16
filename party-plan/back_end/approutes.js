import express from 'express';
import DAppObject from './dapplogic.js';

var router = express.Router();
var dapp = new DAppObject();

router.get('/getAllActive/:limit/:tags', dapp.doGetAllActive);
router.get('/searchPartiesUsers/:limit/:search', dapp.doSearchPartiesUsers);
router.get('/login/:userID', dapp.doLogin);
router.get('/getRSVPs/:userID', dapp.doGetRSVPs);
router.get('/getUserParties/:userID', dapp.doGetUserParties);
router.delete('/deleteParty', dapp.doDeleteParty);
router.post('/createParty', dapp.doCreateParty);
router.get('/getPartyID', dapp.doGetPartyID);
router.patch('/updateCapacity', dapp.doUpdateCapacity);
router.patch('/updateTags', dapp.doUpdateTags);
router.get('/checkExpiring', dapp.doCheckExpiring);

export default router;