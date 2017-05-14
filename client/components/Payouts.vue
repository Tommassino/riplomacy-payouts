<template>
	<div id="component-container">
		<div>Fleet Commander</div>
		<editable-cell 
			v-bind:value="FleetCommander"
			@input="(value)=>{FleetCommander = value; filterUpdated(value)}"
			:autocomplete="true"
			:acApi="getApiUrl"
			acParam="pilotName"
			valueAttribute="id"
			labelAttribute="pilotName"
		></editable-cell>
		<div id='opList'>
			<div class="divTable">
				<div class="divTableHeading">
					<div class="divTableHead"><input type="checkbox" id="checkbox" v-model="allSelected" @click="selectAll"></div>
					<div class="divTableHead">Site Id</div>
					<div class="divTableHead">Fleet Commander</div>
					<div class="divTableHead">Timestamp</div>
					<div class="divTableHead"></div>
				</div>
				<div class="divTableBody">
					<div class="divTableRow" v-for="op in filteredOpList" v-if="!FcFilter || op.FleetCommander.pilotName == FcFilter">
						<div class="divTableCell"><input type="checkbox" id="checkbox" v-model="op.selected"></div>
						<div class="divTableCell">{{op.id}}</div>
						<div class="divTableCell">{{op.FleetCommander.pilotName}}</div>
						<div class="divTableCell">{{op.createdAt}}</div>
						<div class="divTableCell"><a :href="'#/op/'+op.id">Go to Detail</a></div>
					</div>
				</div>
			</div>
			<button v-on:click="addOp">New Op</button>
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
			params: {}
		});
	},
	computed: Object.assign(
		mapState([
			'opList'
		]), mapGetters([
			'sortedSites'
		]), {
			getApiUrl() {
				return 'http://' + config.bind_host + ":" + config.bind_port + config.bind_path + '/get_pilots';
			},
			filteredOpList() {
				return this.opList.filter(this.opFilter);
			}
		}),
	data() {
		return {
			FleetCommander: {
				"id": 1,
				"pilotName": "No Pilot"
			},
			FcFilter: undefined,
			allSelected: false
		}
	},
	methods: Object.assign({
			opFilter: function(op) {
				return !this.FcFilter || op.FleetCommander.pilotName == this.FcFilter;
			},
			selectAll: function(){
				for(var op in this.filteredOpList){
					this.filteredOpList[op].selected = !this.allSelected; //do this better?
				}
			},
			addOp: function() {
				this.socketAddOp({
					socket: this.$socket,
					params: {}
				});
			},
			filterUpdated: function(value) {
				this.FcFilter = value.pilotName
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
