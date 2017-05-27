<template>
    <div id="app">
		<router-link to="/ops">
			<div id="logo" />
		</router-link>
		<div style="float:right">
			<a href="https://docs.google.com/document/d/14XT4kYh0O7GxuaV4ErpNxWdcloKfyC3mRre3Q2MIvxU/edit?usp=sharing">Feature Document -- Suggestions here</a>
		</div>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
}
</script>

<style>
body{
	background-color: #1b1b1b;
	background: url('~./assets/dark-bg.png') repeat top left;
	color: #a6a6a6;
	font-size: 13px;
	font-family: "Helvetica Neue", helvetica,sans-serif;
}
a {
	text-decoration: none;
	outline: none;
	color: #319ebc;
}
#app{
	width: 1000px;
	margin: 0 auto;
}
button{
	border: 1px solid #DEDEDE;
	border-radius: 3px;
	color: #555;
	display: inline-block;
	font: bold 10px/12px "Helvetica Neue",Helvetica,sans-serif;
	padding: 6px 11px;
	text-align: center;
	text-decoration: none;
	text-transform: uppercase;
}
#logo{
	background: url('~./assets/logo.png') no-repeat top left;
	width: 100%;
	height: 85px;
}
</style>
