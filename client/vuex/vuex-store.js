import Vue from 'vue';
import Vuex from 'vuex';
import {
  actions
} from './actions.js'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isConnected: false,
    sitesData: [],
    opData: [],
    opList: []
  },
  getters: {
    sortedSites: (state, getters) => {
      function compare(a, b) {
        return a.createdAt - b.createdAt;
      }
      console.log(state.sitesData.sort(compare));
      return state.sitesData.sort(compare);
    },
    participantPoints: (state, getters) => (participant) => {
      var points = 0;
      points += participant.scout * 0.1
      points += participant.fc * 0.1
      points += participant.db * 0.1
      points += (participant.dps > 0 ? 1 : 0) + (participant.dps > 1 ? (participant.dps-1)*0.5 : 0)
      console.log('participant: '+JSON.stringify(participant)+'points: '+points)
      return Math.min(points, 2.0)
    },
    opSummary: (state, getters) => (sites) => {
      console.log('opSummary');
      var pilots = {};
      var totalIsk = 0;
      var totalPoints = 0;
      for (var siteId in sites) {
        var site = sites[siteId];
        totalIsk += site.estimatedPayout;
        
        var sitePoints = site.SiteParticipations.reduce((acc, cur) => {
          return acc+getters.participantPoints(cur);
        }, 0);
        console.log(sitePoints);
        var siteIsk = parseInt(site.estimatedPayout);

        for (var participationId in site.SiteParticipations) {
          var participant = site.SiteParticipations[participationId]
          var pilotId = participant.PilotId;
          var points = getters.participantPoints(participant);

          if (pilotId in pilots) {
            pilots[pilotId].points += points;
            pilots[pilotId].estimatedPayout += points/sitePoints * siteIsk;
          } else {
            pilots[pilotId] = {
              'Pilot': participant.Pilot,
              'points': points,
              'estimatedPayout': points/sitePoints * siteIsk
            }
          }
          totalPoints += points;
        }
      }
      return {
        totalIsk,
        totalPoints,
        pilots
      }
    }
  },
  mutations: {
    SOCKET_CONNECT(state) {
      console.log('SOCKET_CONNECT');
      state.isConnected = true;
    },

    SOCKET_DISCONNECT(state) {
      console.log('SOCKET_DISCONNECT');
      state.isConnected = false;
    },

    SOCKET_PARTICIPANT_ADDED(state, data) {
      console.log('SOCKET_PARTICIPANT_ADDED');
      console.log(JSON.stringify(data));
      var found = -1;
      for (var i = 0; i < state.sitesData.length; i++) {
        if (state.sitesData[i].id === data.SiteId) {
          state.sitesData[i].SiteParticipations.push(data);
          break;
        }
      }
    },

    SOCKET_OP_ADDED(state, data) {
      console.log('SOCKET_OP_ADDED');
      console.log(JSON.stringify(data));
      state.opList.push(data);
    },

    SOCKET_PARTICIPANT_UPDATE(state, data) {
      console.log('SOCKET_PARTICIPANT_UPDATE');
      console.log(JSON.stringify(data));
      var found = -1;
      for (var i = 0; i < state.sitesData.length; i++) {
        if (state.sitesData[i].id == data.SiteId) {
          var currentSite = state.sitesData[i];
          for (var j = 0; j < currentSite.SiteParticipations.length; j++) {
            if (currentSite.SiteParticipations[j].id == data.id) {
              Object.assign(currentSite.SiteParticipations[j], data);
              break;
            }
          }
          break;
        }
      }
    },

    SOCKET_GET_SITES(state, data) {
      console.log('SOCKET_GET_SITES');
      console.log(JSON.stringify(data));
      state.sitesData = data;
    },

    SOCKET_GET_SITE(state, data) {
      console.log('SOCKET_GET_SITE');
      console.log(JSON.stringify(data));
      if (!data['SiteParticipations'])
        data['SiteParticipations'] = [];
      var found = -1;
      for (var i = 0; i < state.sitesData.length; i++) {
        if (state.sitesData[i].id == data.id) {
          found = i;
          break;
        }
      }
      if (found >= 0)
        Object.assign(state.sitesData[i],data);
      else
        state.sitesData.push(data);
    },

    SOCKET_GET_OP(state, data) {
      console.log('SOCKET_GET_OP');
      console.log(JSON.stringify(data));
      state.opData = data
    },

    SOCKET_GET_OPS(state, data) {
      console.log('SOCKET_GET_OPS');
      console.log(JSON.stringify(data));
      state.opList = data
    },

    SOCKET_SITE_DELETED(state, data) {
      console.log('SOCKET_SITE_DELETED');
      console.log(JSON.stringify(data));
      var found = -1;
      for (var i = 0; i < state.sitesData.length; i++) {
        if (state.sitesData[i].id == data.siteId) {
          state.sitesData.splice(i, 1);
          break;
        }
      }
    },

    SOCKET_PARTICIPANT_DELETED(state, data) {
      console.log('SOCKET_PARTICIPANT_DELETED');
      console.log(JSON.stringify(data));
      var found = -1;
      for (var i = 0; i < state.sitesData.length; i++) {
        if (state.sitesData[i].id == data.SiteId) {
          var participants = state.sitesData[i].SiteParticipations;
          for (var j in participants) {
            if (participants[j].id == data.id) {
              participants.splice(j, 1);
              break;
            }
          }
          break;
        }
      }
    },
  },
  actions: actions()
});