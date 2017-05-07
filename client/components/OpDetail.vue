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
				<div v-for="site in sitesData">
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
			<div v-if="opData.FleetCommander" class="detail-row-value">
				<editable-cell 
					v-bind:value="opData.FleetCommander"
					@input="(value)=>{opData.FleetCommander = value; opData.FleetCommanderId=value.id; updateOp();}"
					:autocomplete="true"
					acApi="http://localhost:3000/get_pilots"
					acParam="pilotName"
					valueAttribute="id"
					labelAttribute="pilotName"
				></editable-cell>
			</div>
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

		<div v-for="(site, siteIndex) in sitesData">
			Site Id: {{site.id}}
			Site Created: {{site.createdAt}}
			Site Isk: {{site.estimatedPayout}}

			<button v-on:click="openIskDialog(site)">Set Site ISK</button>
			<button v-on:click="toggleDetails(site)">Toggle Details</button>

			<div class="divTable" v-if="site.showDetails">
				<div class="divTableHeading">
					<div class="divTableHead">Pilot Id</div>
					<div class="divTableHead">Pilot Name</div>
					<div class="divTableHead">Points</div>
					<div class="divTableHead">ISK Share</div>
				</div>
				<div class="divTableBody">
					<div class="divTableRow" v-for="(participant, participantIndex) in site.SiteParticipations">
						<div class="divTableCell">{{participant.Pilot.id}}</div>
						<div class="divTableCell">
							<editable-cell 
								v-bind:value="sitesData[siteIndex].SiteParticipations[participantIndex].Pilot"
								@input="(value)=>{participant.Pilot = value; participant.PilotId=value.id; updateParticipant(participant);}"
								:autocomplete="true"
								acApi="http://localhost:3000/get_pilots"
								acParam="pilotName"
								valueAttribute="id"
								labelAttribute="pilotName"
							></editable-cell>
						</div>
						<div class="divTableCell">
							<editable-cell 
								v-bind:value="sitesData[siteIndex].SiteParticipations[participantIndex].points"
								@input="(value)=>{participant.points = value; updateParticipant(participant);}"
							></editable-cell>
						</div>
						<div class="divTableCell">{{siteIsk(site,participant)}}</div>
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

import {
	mapState
} from 'vuex';
export default {
	name: 'siteDetail',
	components: {
		EditableCell,
		Modal
	},
	mounted() {
		var opId = this.$route.params.opId;
		this.$store.dispatch('SEND_JOIN_ROOM',{
			socket: this.$socket,
			params: {
				room: opId
			}
		});
		this.$store.dispatch('SEND_GET_OP', {
			socket: this.$socket,
			params: {
				id: opId
			}
		});
		this.$store.dispatch('SEND_GET_SITES', {
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
			showIskDialog: false
		}
	},
	computed: mapState({
		isConnected: state => state.isConnected,
		sitesData: state=>state.sitesData,
		opData: state=>state.opData,
	}),
	methods: {
		siteIsk: function(site, participant){
			var total = 0;
			for(var id in site.SiteParticipations){
				total+=parseInt(site.SiteParticipations[id].points);
			}
			return (site.estimatedPayout || 0)/total*participant.points;
		},
		openIskDialog: function(site){
			console.log(site);
			this.iskDialogSiteData = site;
			this.showIskDialog = true;
		},
		onIskDialogSubmit: function(data){
			console.log(data);
			//#TODO subtract total
			this.iskDialogSiteData.estimatedPayout = data.estimatedPayout;
			this.showIskDialog = false;
			this.updateSite(this.iskDialogSiteData);
		},
		siteIsk: function(site, participant){
			var total = 0;
			for(var id in site.SiteParticipations){
				total+=parseInt(site.SiteParticipations[id].points);
			}
			return (site.estimatedPayout || 0)/total*participant.points;
		},
		deleteOp: function(){
			this.$store.dispatch('SEND_DELETE_OP', {
				socket: this.$socket,
				params: {
					opId: this.opData.id
				}
			});
		},
		joinRoomRepeat: function() {
			this.$store.dispatch('SEND_JOIN_ROOM', {
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
			this.$store.dispatch('SEND_ADD_SITE', {
				socket: this.$socket,
				params: {
					opId: this.opData.id
				}
			});
		},
		addParticipant: function(site) {
			this.$store.dispatch('SEND_ADD_PARTICIPANT', {
				socket: this.$socket,
				params: {
					siteId: site.id
				}
			});
		},
		updateSite: function(site){
			this.$store.dispatch('SEND_UPDATE_SITE', {
				socket: this.$socket,
				params: site
			});
		},
		updateOp: function(){
			this.$store.dispatch('SEND_UPDATE_OP', {
				socket: this.$socket,
				params: this.opData
			});
		},
		updateParticipant: function(participant){
			//var participant = this.sitesData[siteIndex].SiteParticipations[participantIndex];
			this.$store.dispatch('SEND_UPDATE_PARTICIPANT', {
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
			if (site.showDetails)
				site.showDetails = false;
			else //undefined or false - create using vue
				this.$set(site, 'showDetails', true);
		},
		toggleDebug: function() {
			this.debug = !this.debug;
		}
	}
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

</style>
