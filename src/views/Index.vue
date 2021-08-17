<template>
<div class="editor">
    <editor v-model="editorData"/>
    <button class="submit" @click="handleSubmit()">Submit</button>
</div>
</template>
<script>
import editor from '../components/editor'
export default {
    name:'Index',
    components:{editor},
    data(){
        return{
            editorData:''
        }
    },
    watch:{
        editorData(val){
            console.log(val);
        }
    },
    methods:{
        handleSubmit(){
            // location.href="http://localhost:8080"
            console.log(document.cookie);
            this.$router.push({name: 'Result', params:{ data: this.editorData} })
        }
    },
    created(){
        
    }
}
</script>
<style lang="scss" scoped>
@import '~@/assets/css/content';
.editor{
    .submit{
        margin-top: 20px;
        border: 0;
        border-radius: 4px;
        padding: 10px;
        cursor: pointer;
        background-color: rgba(21, 47, 197, 0.452);
        color:#fff;
        font-size: 16px;
    }
}
</style>