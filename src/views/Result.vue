<template>
    <div>
        <div v-html="data"></div>
    </div>
</template>
<script>
export default {
    name:'Result',
    data(){
        return{
            data:this.$route.params.data
        }
    },
    created(){
        console.log(this.$route.params.data);
    }
}
</script>
<style lang="scss">
	@import '~@/assets/css/content'
</style>