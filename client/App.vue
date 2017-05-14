<template>
    <div id="app">
        <p>
            <router-link to="/ops">Op List</router-link>
            <router-link to="/op">Op Detail</router-link>
            <router-link to="/payouts">Do Payouts</router-link>
        </p>
        <router-view></router-view>
    </div>
</template>

<script>
export default {
}
</script>

<style>
</style>
