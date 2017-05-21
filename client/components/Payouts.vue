<template>
	<div id="component-container">
		<h2>Fleet Selection</h2>
		<div>
			Fleet Commander
			<editable-cell 
				v-bind:value="FleetCommander"
				@input="(value)=>{FleetCommander = value; filterUpdated(value)}"
				:autocomplete="true"
				:acApi="getApiUrl"
				acParam="pilotName"
				valueAttribute="id"
				labelAttribute="pilotName"
				:nullable="true"
			></editable-cell>
		</div>
		<div id='opList'>
			<div class="divTable">
				<div class="divTableHeading">
					<div class="divTableHead"><input type="checkbox" id="checkbox" v-model="allSelected" @click="selectAll"></div>
					<div class="divTableHead">Fleet Commander</div>
					<div class="divTableHead">Timestamp</div>
					<div class="divTableHead">Estimated Payout</div>
				</div>
				<div class="divTableBody">
					<div class="divTableRow" v-for="op in filteredOpList" v-if="!FcFilter || op.FleetCommander.pilotName == FcFilter">
						<div class="divTableCell"><input type="checkbox" id="checkbox" v-model="op.selected" v-on:change="selectionChanged(op)"></div>
						<div class="divTableCell">{{op.FleetCommander.pilotName}}</div>
						<div class="divTableCell">{{op.createdAt}}</div>
						<div class="divTableCell">{{opSummary(op.Sites).totalIsk | iskString}}</div>
					</div>
				</div>
			</div>
		</div>

		<h2>Participants</h2>
		<div id='participationList'>
			<div>
				Total ISK Payout: <editable-cell v-model="actualPayout"></editable-cell>
			</div>
			<div>
				<button v-on:click="confirmPayouts()">Finish Payouts</button>
			</div>
			<div class="divTable">
				<div class="divTableHeading">
					<div class="divTableHead">Pilot Name</div>
					<div class="divTableHead">Points</div>
					<div class="divTableHead">Estimated Payout</div>
					<div class="divTableHead">Actual Payout</div>
				</div>
				<div class="divTableBody">
					<div class="divTableRow" v-for="pilot in totalSummary.pilots">
						<div class="divTableCell">{{pilot.Pilot.pilotName}}</div>
						<div class="divTableCell">{{pilot.points}}</div>
						<div class="divTableCell">{{pilot.estimatedPayout | iskString}}</div>
						<div class="divTableCell">{{parseInt(actualPayout)/totalSummary.totalIsk*pilot.estimatedPayout | iskString}}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import EditableCell from './EditableCell.vue';

import config from '../config/dev.env.js';
import {
	mapState,
	mapActions,
	mapGetters
} from 'vuex';

export default {
	name: 'payouts',
	components: {
		EditableCell
	},
	mounted() {
		this.socketGetOps({
			socket: this.$socket,
			params: {'full':true}
		});
	},
	computed: Object.assign(
		mapState([
			'opList'
		]), mapGetters([
			'sortedSites',
			'opSummary'
		]), {
			getApiUrl() {
				return 'http://' + config.bind_host + ":" + config.bind_port + config.bind_path + '/get_pilots';
			}
		}),
	watch: {
		opList: function(value){
			if(!this.FcFilter || this.FcFilter==''){
			console.log('oplist updated');
				this.filteredOpList = value;
			}
		},
		FcFilter: function(value) {
			console.log('FcFilter updated');
			this.filteredOpList = this.opList.filter(this.opFilter);
		},
		filteredOpList: function(value){
			console.log('filteredOpList updated');
			for(var op in value){
				if(!('selected' in value[op]))
					this.$set(value[op],'selected',false);
			}
			this.selectionChanged();
		},
		selectedOpList: function(value) {
			console.log('selectedOpList updated');
			var ops = this.selectedOpList;
			console.log(ops);
			var totalSummary = {
				totalIsk: 0,
				totalPoints: 0,
				pilots: {}
			};
			for (var opId in ops) {
				var op = ops[opId];
				var opSummary = this.opSummary(op.Sites);

				totalSummary.totalIsk += opSummary.totalIsk;
				totalSummary.totalPoints += opSummary.totalPoints;

				for (var pilotId in opSummary.pilots) {
					var pilotSummary = opSummary.pilots[pilotId]
					if (pilotId in totalSummary.pilots) {
						totalSummary.pilots[pilotId].points += pilotSummary.points;
						totalSummary.pilots[pilotId].estimatedPayout += pilotSummary.estimatedPayout;
					} else {
						totalSummary.pilots[pilotId] = {
							'Pilot': pilotSummary.Pilot,
							'points': pilotSummary.points,
							'estimatedPayout': pilotSummary.estimatedPayout
						}
					}
				}
			}
			console.log(totalSummary);
			this.totalSummary = totalSummary;
		}
	},
	data() {
		return {
			FleetCommander: '',
			FcFilter: undefined,
			allSelected: false,
			filteredOpList: [],
			selectedOpList: [],
			totalSummary: {},
			actualPayout: ''
		}
	},
	methods: Object.assign({
			confirmPayouts: function(){

			},
			opFilter: function(op) {
				return !this.FcFilter || op.FleetCommander.pilotName == this.FcFilter;
			},
			selectAll: function() {
				console.log("setting all to " + !this.allSelected)
				for (var op in this.filteredOpList) {
					this.filteredOpList[op].selected = !this.allSelected; //do this better?
				}
				console.log(this.filteredOpList);
				this.selectionChanged();
			},
			addOp: function() {
				this.socketAddOp({
					socket: this.$socket,
					params: {}
				});
			},
			filterUpdated: function(value) {
				this.FcFilter = value ? value.pilotName : '';
			},
			selectionChanged: function(op) {
				this.selectedOpList = this.filteredOpList.filter((op) => {return op.selected;})
				console.log(this.selectedOpList);
			}
		},
		mapActions([
			'socketGetOps',
			'socketAddOp',
			'socketDeleteOp'
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
</style>
