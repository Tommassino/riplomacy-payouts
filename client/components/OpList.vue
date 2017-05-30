<template>
	<div id='opList'>
		<h2>Fleet List</h2>
		<div class="divTable">
			<div class="divTableHeading">
				<div class="divTableHead">Fleet Commander</div>
				<div class="divTableHead">Timestamp</div>
				<div class="divTableHead"></div>
			</div>
			<div class="divTableBody">
				<div class="divTableRow" v-for="op in opList">
					<div class="divTableCell">{{op.FleetCommander ? op.FleetCommander.pilotName : ''}}</div>
					<div class="divTableCell">{{op.createdAt | ageTime}}</div>
					<div class="divTableCell"><a :href="'#/op/'+op.id">Go to Detail</a></div>
				</div>
			</div>
		</div>
		<button v-on:click="addOp">New Op</button>
		<router-link to="/payouts">Do Payouts</router-link>
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
