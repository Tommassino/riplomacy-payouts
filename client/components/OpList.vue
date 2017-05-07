<template>
	<div id='opList'>
		<div class="divTable">
			<div class="divTableHeading">
				<div class="divTableHead">Site Id</div>
				<div class="divTableHead">Fleet Commander</div>
				<div class="divTableHead">Timestamp</div>
				<div class="divTableHead"></div>
			</div>
			<div class="divTableBody">
				<div class="divTableRow" v-for="op in opList">
					<div class="divTableCell">{{op.id}}</div>
					<div class="divTableCell">{{op.FleetCommander.pilotName}}</div>
					<div class="divTableCell">{{op.createdAt}}</div>
					<div class="divTableCell"><a :href="'#/op/'+op.id">Go to Detail</a></div>
				</div>
			</div>
		</div>
		<button v-on:click="addOp">New Op</button>
	</div>
</template>

<script>
import {
	mapState,
	mapActions
} from 'vuex'
export default {
	name: 'opList',
	mounted() {
		this.socketGetOps({
			socket: this.$socket,
			params: {}
		});
	},
	computed: mapState([
		'opList'
	]),
	methods: Object.assign({
			addOp: function() {
				this.socketAddOp({
					socket: this.$socket,
					params: {}
				});
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
