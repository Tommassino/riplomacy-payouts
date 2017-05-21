<template>
	<div id="opDetail">
		<button v-on:click="toggleDebug">Toggle Debug</button>
		
		<div v-if="debug">
			<table>
				<tr v-for="(value, propertyName) in opData">
					<td>{{propertyName}}</td>
					<td>{{value}}</td>
				</tr>
			</table>
			<table>
				<div v-for="site in sortedSites">
					<tr v-for="(value, propertyName) in site">
						<td>{{propertyName}}</td>
						<td>{{value}}</td>
					</tr>
				</div>
			</table>
		</div>

		<div>Connected: {{isConnected}} </div>
		<div class="detail-row">
			<div class="detail-row-label">Fleet Commander</div>
			<editable-cell 
					v-bind:value="opData.FleetCommanderId ? opData.FleetCommander : ''"
					@input="(value)=>{opData.FleetCommander = value; opData.FleetCommanderId=value.id; updateOp();}"
					:autocomplete="true"
					:acApi="getApiUrl"
					acParam="pilotName"
					valueAttribute="id"
					labelAttribute="pilotName"
				></editable-cell>
		</div>
		<div class="detail-row">
			<div class="detail-row-label">Date Created</div>
			<div class="detail-row-value">{{opData.createdAt}}</div>
		</div>
		<div class="detail-row">
			<div class="detail-row-label">Actual Payout</div>
			<div class="detail-row-value">{{opData.actualPayout}}</div>
		</div>

		<button v-on:click="deleteOp">Delete Op</button>

		<modal :showModal="showIskDialog" closeAction="closeIskDialog" 
			v-on:submit="onIskDialogSubmit" v-model="iskDialogSiteData" v-on:close="onIskDialogSubmit">
		</modal>

		<div>
			Fleet Summary
			<div v-for="pilot in fleetSummary.pilots" v-if="Object.keys(fleetSummary.pilots).length > 0">
			</div>
			<div class="divTable">
				<div class="divTableHeading">
					<div class="divTableHead">Pilot Name</div>
					<div class="divTableHead">Points Total</div>
					<div class="divTableHead">ISK Share</div>
				</div>
				<div class="divTableBody">
					<div class="divTableRow" v-for="(participant, participantIndex) in fleetSummary.pilots" v-if="participant.Pilot != null">
						<div class="divTableCell">{{participant.Pilot.pilotName}}</div>
						<div class="divTableCell">{{participant.points}}</div>
						<div class="divTableCell">{{participant.points/fleetSummary.totalPoints*fleetSummary.fleetIsk}}</div>
					</div>
				</div>
			</div>
		</div>

		<div v-for="(site, siteIndex) in sortedSites">
			Site Id: {{site.id}}
			Site Created: {{site.createdAt}}
			Site Isk: {{site.estimatedPayout}}

			<button v-on:click="openIskDialog(site)">Set Site ISK</button>
			<button v-on:click="toggleDetails(site)">Toggle Details</button>
			<button class="delete-button" v-on:click="deleteSite(site)"> </button>

			<div class="divTable" v-if="siteDetailOpen(site)">
				<div class="divTableHeading">
					<div class="divTableHead">Pilot Id</div>
					<div class="divTableHead">Pilot Name</div>
					<div class="divTableHead">Points</div>
					<div class="divTableHead">ISK Share</div>
					<div class="divTableHead"></div>
				</div>
				<div class="divTableBody">
					<div class="divTableRow" v-for="(participant, participantIndex) in site.SiteParticipations">
						<div class="divTableCell">{{participant.id}}</div>
						<div class="divTableCell">
							<editable-cell 
								v-bind:value="participant.Pilot ? participant.Pilot : ''"
								@input="(value)=>{participant.Pilot = value; participant.PilotId=value.id; updateParticipant(participant);}"
								:autocomplete="true"
								:acApi="getApiUrl"
								acParam="pilotName"
								valueAttribute="id"
								labelAttribute="pilotName"
							></editable-cell>
						</div>
						<div class="divTableCell">
							<editable-cell 
								v-bind:value="participant.points"
								@input="(value)=>{participant.points = value; updateParticipant(participant);}"
							></editable-cell>
						</div>
						<div class="divTableCell">{{siteIsk(site,participant)}}</div>
						<div class="divTableCell"><button class="delete-button" v-on:click="deleteParticipant(participant)"> </button></div>
					</div>
				</div>
				<button v-on:click="addParticipant(site)">Add Participant</button>
			</div>
		</div>
		<button v-on:click="addSite">Add Site</button>
	</div>
</template>

<script>
import EditableCell from './EditableCell.vue';
import Modal from './ISKModal.vue';

import config from '../config/dev.env.js';

import {
	mapState,
	mapGetters,
	mapActions
} from 'vuex';
export default {
	name: 'siteDetail',
	components: {
		EditableCell,
		Modal
	},
	mounted() {
		var opId = this.$route.params.opId;
		this.socketGetOp({
			socket: this.$socket,
			params: {
				id: opId
			}
		});
		this.socketGetSites({
			socket: this.$socket,
			params: {
				opId: opId
			}
		});
		this.joinRoomRepeat();
	},
	data() {
		return {
			debug: false,
			iskDialogSiteData: {},
			showIskDialog: false,
			openedSite: undefined
		}
	},
	computed: Object.assign(
		mapState([
			'isConnected',
			'opData'
		]), mapGetters([
			'sortedSites'
		]), {
			getApiUrl() {
				return 'http://' + config.bind_host + ":" + config.bind_port + config.bind_path + '/get_pilots';
			},
			fleetSummary() {
				var pilots = {};
				var sites = this.sortedSites;
				var fleetIsk = 0;
				var totalPoints = 0;
				for (var siteId in sites) {
					var site = sites[siteId];
					fleetIsk += site.estimatedPayout;
					for (var participationId in site.SiteParticipations) {
						var participant = site.SiteParticipations[participationId]
						var pilotId = participant.PilotId;
						if (pilotId in pilots) {
							pilots[pilotId].points += participant.points;
						} else {
							pilots[pilotId] = participant;
						}
						totalPoints += participant.points;
					}
				}
				console.log(pilots)
				return {
					fleetIsk,
					totalPoints,
					pilots
				}
			}
		}),
	methods: Object.assign({
		siteDetailOpen: function(site) {
			if (this.openedSite) {
				return this.openedSite == site.id;
			} else {
				return this.sortedSites[this.sortedSites.length - 1].id == site.id;
			}
		},
		siteIsk: function(site, participant) {
			var total = 0;
			for (var id in site.SiteParticipations) {
				total += parseInt(site.SiteParticipations[id].points);
			}
			return (site.estimatedPayout || 0) / total * participant.points;
		},
		openIskDialog: function(site) {
			this.iskDialogSiteData = site;
			this.showIskDialog = true;
		},
		onIskDialogSubmit: function(data) {
			console.log(data);
			//#TODO subtract total
			this.iskDialogSiteData.estimatedPayout = data.estimatedPayout;
			this.showIskDialog = false;
			this.updateSite(this.iskDialogSiteData);
		},
		siteIsk: function(site, participant) {
			var total = 0;
			for (var id in site.SiteParticipations) {
				total += parseInt(site.SiteParticipations[id].points);
			}
			return (site.estimatedPayout || 0) / total * participant.points;
		},
		deleteOp: function() {
			if (!confirm('Are you sure?'))
				return;
			this.socketDeleteOp({
				socket: this.$socket,
				params: {
					opId: this.opData.id
				}
			});
		},
		deleteSite: function(site) {
			if (!confirm('Are you sure?'))
				return;
			this.socketDeleteSite({
				socket: this.$socket,
				params: {
					siteId: site.id
				}
			});
		},
		deleteParticipant: function(participant) {
			if (!confirm('Are you sure?'))
				return;
			this.socketDeleteParticipant({
				socket: this.$socket,
				params: participant
			});
		},
		joinRoomRepeat: function() {
			this.socketJoinRoom({
				socket: this.$socket,
				params: {
					room: this.$route.params.opId
				}
			});
			setTimeout(() => {
				this.joinRoomRepeat()
			}, 60000);
		},
		addSite: function() {
			this.socketAddSite({
				socket: this.$socket,
				params: {
					opId: this.opData.id
				}
			});
		},
		addParticipant: function(site) {
			this.socketAddParticipant({
				socket: this.$socket,
				params: {
					siteId: site.id
				}
			});
		},
		updateSite: function(site) {
			this.socketUpdateSite({
				socket: this.$socket,
				params: site
			});
		},
		updateOp: function() {
			this.socketUpdateOp({
				socket: this.$socket,
				params: this.opData
			});
		},
		updateParticipant: function(participant) {
			this.socketUpdateParticipant({
				socket: this.$socket,
				params: {
					id: participant.id,
					siteId: participant.SiteId,
					pilotId: participant.PilotId,
					points: participant.points
				}
			});
		},
		toggleDetails: function(site) {
			this.openedSite = site.id;
		},
		toggleDebug: function() {
			this.debug = !this.debug;
		}
	}, mapActions([
		'socketJoinRoom',
		'socketAddOp',
		'socketGetOps',
		'socketGetOp',
		'socketUpdateOp',
		'socketDeleteOp',
		'socketAddSite',
		'socketDeleteSite',
		'socketGetSites',
		'socketUpdateSite',
		'socketAddParticipant',
		'socketUpdateParticipant',
		'socketDeleteParticipant'
	]))
}
</script>

<style scoped>
.divTable{
	display: table;
	width: 100%;
}
.divTableRow {
	display: table-row;
}
.divTableHeading {
	background-color: #EEE;
	display: table-header-group;
}
.divTableCell, .divTableHead {
	border: 1px solid #999999;
	display: table-cell;
	padding: 3px 10px;
}
.divTableHeading {
	background-color: #EEE;
	display: table-header-group;
	font-weight: bold;
}
.divTableFoot {
	background-color: #EEE;
	display: table-footer-group;
	font-weight: bold;
}
.divTableBody {
	display: table-row-group;
}
.delete-button{
	background-image: url('~../assets/trashcan.png');
	background-size: contain;
	width: 25px;
	height: 25px;
	display: inline-block;
}

</style>
