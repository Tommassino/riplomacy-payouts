<template>
	<div id="opDetail">
		<modal :showModal="showIskDialog" closeAction="closeIskDialog" 
			v-on:submit="onIskDialogSubmit" v-model="iskDialogSiteData" v-on:close="onIskDialogSubmit">
		</modal>

		<button id="debug" v-on:click="toggleDebug">Toggle Debug</button>
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

		<div id="fleet-detail">
			<h2>Fleet Detail</h2>
			<div class="detail-row">
				<div class="detail-row-label">Fleet Commander</div>
				<editable-cell class="detail-row-value"
						v-bind:value="opData.FleetCommanderId ? opData.FleetCommander : ''"
						@input="(value)=>{opData.FleetCommander = value; opData.FleetCommanderId=value.id; updateOp();}"
						:autocomplete="true"
						:acApi="getApiUrl"
						acParam="pilotName"
						valueAttribute="id"
						labelAttribute="pilotName"
					></editable-cell>
				<div class="fc-pic">
					<img v-if="opData.FleetCommander" :src="'https://image.eveonline.com/Character/'+opData.FleetCommanderId+'_256.jpg'" />
				</div>
			</div>
			<div class="detail-row">
				<div class="detail-row-label">Date Created</div>
				<div class="detail-row-value">{{opData.createdAt | ageTime}}</div>
			</div>

			<button v-on:click="deleteOp">Delete Op</button>
		</div>

		<div id="fleet-summary">
			<h2>Fleet Summary</h2>
			<div v-for="pilot in getFleetSummary.pilots" v-if="Object.keys(getFleetSummary.pilots).length > 0">
			</div>
			<div class="divTable">
				<div class="divTableHeading">
					<div class="divTableHead">Pilot Name</div>
					<div class="divTableHead">Points Total</div>
					<div class="divTableHead">ISK Share</div>
				</div>
				<div class="divTableBody">
					<div class="divTableRow" v-for="(participant, participantIndex) in getFleetSummary.pilots" v-if="participant.Pilot != null">
						<div class="divTableCell">{{participant.Pilot.pilotName}}</div>
						<div class="divTableCell">{{participant.points | shortNumber}}</div>
						<div class="divTableCell">{{participant.estimatedPayout | iskString}}</div>
					</div>
				</div>
			</div>
		</div>

		<div id="fleet-sites">
			<h2>Site List</h2>
			<div v-for="(site, siteIndex) in sortedSites" class="fleet-site">
				<div class="control-panel" v-on:click="toggleDetails(site)">
					Site {{site.id}} - {{site.createdAt | ageTime}}
					<button class="delete-button right" v-on:click="deleteSite(site)"> </button>
				</div>

				<div class="divTable" v-if="siteDetailOpen(site)">
					<div class="divTableHeading">
						<div class="divTableHead">Pilot Name</div>
						<div class="divTableHead">Points</div>
						<div class="divTableHead">ISK Share</div>
						<div class="divTableHead"></div>
					</div>
					<div class="divTableBody">
						<div class="divTableRow" v-for="(participant, participantIndex) in site.SiteParticipations">
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
								<incremental-button :icon="require('../assets/star.png')" v-bind:value="participant.fc" 
									@input="(value)=>{participant.fc = value; updateParticipant(participant);}"/>
								<incremental-button :icon="require('../assets/db.png')" v-bind:value="participant.db" 
									@input="(value)=>{participant.db = value; updateParticipant(participant);}"/>
								<incremental-button :icon="require('../assets/dps.png')" v-bind:value="participant.dps" 
									@input="(value)=>{participant.dps = value; updateParticipant(participant);}"/>
								<incremental-button :icon="require('../assets/scout.png')" v-bind:value="participant.scout" 
									@input="(value)=>{participant.scout = value; updateParticipant(participant);}"/>
							</div>
							<div class="divTableCell">{{siteIsk(site,participant) | iskString}}</div>
							<div class="divTableCell"><button class="delete-button" v-on:click="deleteParticipant(participant)"> </button></div>
						</div>
					</div>
					<div class="divTableRow noborders">
						<div class="divTableCell">
							<button v-on:click="addParticipant(site)">Add Participant</button>
						</div>
						<div class="divTableCell"></div>
						<div class="divTableCell">
							{{site.estimatedPayout | iskString}}
						</div>
						<div class="divTableCell">
							<button v-on:click="openIskDialog(site)">Set Site ISK</button>
						</div>
					</div>
				</div>
			</div>
			<button v-on:click="addSite">Add Site</button>
		</div>
	</div>
</template>

<script>
import EditableCell from './EditableCell.vue';
import IncrementalButton from './IncrementalButton.vue';
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
		Modal,
		IncrementalButton
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
			'sortedSites',
			'opSummary',
			'participantPoints'
		]), {
			getApiUrl() {
				return 'http://' + config.bind_host + ":" + config.bind_port + config.bind_path + '/get_pilots';
			},
			getFleetSummary() {
				return this.opSummary(this.sortedSites);
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
				total += this.participantPoints(site.SiteParticipations[id]);
			}
			return (site.estimatedPayout || 0) / total * this.participantPoints(participant);
		},
		openIskDialog: function(site) {
			this.iskDialogSiteData = site;
			this.showIskDialog = true;
		},
		onIskDialogSubmit: function(data) {
			//#TODO subtract total
			this.iskDialogSiteData.estimatedPayout = data.estimatedPayout;
			this.showIskDialog = false;
			this.updateSite(this.iskDialogSiteData);
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
			var clean = {};
			Object.assign(clean, JSON.parse(JSON.stringify(participant)));
			delete clean.Pilot;
			delete clean.createdAt;
			delete clean.Site;

			this.socketUpdateParticipant({
				socket: this.$socket,
				params: clean
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
.noborders .divTableCell{
	border: none;
}
.divTableHeading {
	background-color: #555;
	display: table-header-group;
}
.divTableCell, .divTableHead {
	border: none;
	display: table-cell;
	padding: 3px 10px;
}
.divTableHeading {
	background-color: #555;
	display: table-header-group;
	font-weight: bold;
}
.divTableFoot {
	background-color: #555;
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
#debug{
	float: right;
	display: none;
}
#fleet-detail{
	float: left;
	width: 200px;
	font-size: 15px;
}
#fleet-summary{
	float: left;
	width: 800px;
}
#fleet-sites{
	padding-top: 15px;
	clear: both;
}
#opDetail{
	clear: both;
}
h2{
	color: white;
}
.right{
	float: right;
}
.fleet-site{
	clear: both;
}
.control-panel{
	border: 1px solid #555;
	border-radius: 3px;
	padding: 2px;
	background-color: #444;
	color: white;
	cursor: pointer;
}
.detail-row-label{
	display: inline-block;
}
.detail-row-value{
	display: inline-block;
}
.fc-pic{
	width: 60%;	
	height: 140px;
	margin: 20px;
}
.fc-pic img{
	width: 100%;
	height: auto;
	border: solid 1px white;
}
</style>
