<template>
	<div id="button-container">
		<img class="icon" :src="icon" />
		<div class="value">{{value}}</div>
		<div class="button-column">
			<button class="button-plus" @click="increment(1)"/>
			<button class="button-minus" @click="increment(-1)"/>
		</div>
	</div>
</template>

<script>
export default {
	name: 'incremental-button',
	props: {
		icon: String,
		value: Number
	},
	methods: {
		increment: function(value) {
			if(this.value+value < 0)
				return
			this.$emit('input', this.value+value);
		}
	}
}
	
</script>

<style>
#button-container{
	padding: 0;
	margin: 0;
	display: inline-block;
}
.icon{
	width:20px; 
	height:20px;
	display: inline-block;
}
.value{
	position: relative;
	display: inline;
}
.button-column{
	margin: 0;
	padding: 0;
	display: inline-block;
	vertical-align: bottom;
}
.button-plus{
	background-image: url('~../assets/plus.png');
	background-color: #008800;
}
.button-minus{
	background-image: url('~../assets/minus.png');
	background-color: #880000;
}
.button-plus, .button-minus{
	background-size: contain;
	background-position: center center;
	display: block;
	width: 10px;
	height: 10px;
	margin: 0;
	padding: 0;
	border: none;
}
</style>